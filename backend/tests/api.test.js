import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import pool from '../src/config/db.js';

// These tests only hit paths that are rejected BEFORE the database is used
// (validation, 404, bad JSON), so they run without MySQL.
let server;
let base;

before(async () => {
    await new Promise((resolve) => { server = app.listen(0, resolve); });
    base = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end().catch(() => {});
});

const send = (method, path, body, rawBody) =>
    fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body))
    });

test('POST /targets with bad input -> 422 VALIDATION_ERROR', async () => {
    const res = await send('POST', '/targets', { name: '', targetType: 'website', address: 'ftp://x', checkMethod: 'http' });
    assert.equal(res.status, 422);
    const json = await res.json();
    assert.equal(json.error.code, 'VALIDATION_ERROR');
    assert.ok(json.error.details.length >= 2);
});

test('PATCH /targets/:id with empty body -> 422', async () => {
    assert.equal((await send('PATCH', '/targets/1', {})).status, 422);
});

test('PATCH /targets/:id/enabled needs a real boolean', async () => {
    assert.equal((await send('PATCH', '/targets/1/enabled', {})).status, 422);
    assert.equal((await send('PATCH', '/targets/1/enabled', { isEnabled: 'false' })).status, 422);
});

test('history/uptime/events/export reject bad query params -> 422', async () => {
    assert.equal((await send('GET', '/targets/1/history?limit=9999')).status, 422);
    assert.equal((await send('GET', '/targets/1/history?page=0')).status, 422);
    assert.equal((await send('GET', '/targets/1/history?from=not-a-date')).status, 422);
    assert.equal((await send('GET', '/targets/1/uptime?to=nope')).status, 422);
    assert.equal((await send('GET', '/events?isResolved=maybe')).status, 422);
    assert.equal((await send('GET', '/targets/reports/results.csv?targetId=abc')).status, 422);
});

test('malformed JSON -> 400 INVALID_JSON', async () => {
    const res = await send('POST', '/targets', undefined, '{ not json');
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'INVALID_JSON');
});

test('unknown API route -> JSON 404', async () => {
    const res = await send('GET', '/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NOT_FOUND');
});

test('health returns 503 (not a crash) when the DB is unreachable', async () => {
    const originalQuery = pool.query.bind(pool);
    pool.query = () => Promise.reject(new Error('simulated DB failure'));
    try {
        const res = await send('GET', '/health');
        assert.equal(res.status, 503);
        assert.equal((await res.json()).error.code, 'DB_UNAVAILABLE');
    } finally {
        pool.query = originalQuery;
    }
});

test('GET /targets with invalid status -> 400 INVALID_STATUS', async () => {
    const res = await send('GET', '/targets?status=invalid');
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error.code, 'INVALID_STATUS');
    assert.match(json.error.message, /invalid status/i);

    const resEmpty = await send('GET', '/targets?status=');
    assert.equal(resEmpty.status, 400);

    const resUnknown = await send('GET', '/targets?status=unknown');
    assert.equal(resUnknown.status, 400);
});

test('GET /targets without status parameter returns all targets', async () => {
    const originalQuery = pool.query;
    let capturedSql;
    pool.query = async (sql) => {
        capturedSql = sql;
        return [[
            { id: 1, name: 'Target A', current_status: 'online' },
            { id: 2, name: 'Target B', current_status: 'offline' }
        ]];
    };
    try {
        const res = await send('GET', '/targets');
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.length, 2);
        assert.match(capturedSql, /SELECT \* FROM monitored_targets ORDER BY created_at DESC/i);
        assert.doesNotMatch(capturedSql, /WHERE current_status/i);
    } finally {
        pool.query = originalQuery;
    }
});

for (const status of ['online', 'warning', 'critical', 'offline']) {
    test(`GET /targets?status=${status} returns only ${status} targets`, async () => {
        const originalQuery = pool.query;
        let capturedSql;
        let capturedParams;
        pool.query = async (sql, params) => {
            capturedSql = sql;
            capturedParams = params;
            return [[{ id: 1, name: `Target ${status}`, current_status: status }]];
        };
        try {
            const res = await send('GET', `/targets?status=${status}`);
            assert.equal(res.status, 200);
            const data = await res.json();
            assert.equal(data.length, 1);
            assert.equal(data[0].current_status, status);
            assert.match(capturedSql, /WHERE current_status = \?/i);
            assert.deepEqual(capturedParams, [status]);
        } finally {
            pool.query = originalQuery;
        }
    });
}

test('POST /targets/:id/check on non-existent target -> 404 NOT_FOUND', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql) => {
        if (sql.includes('SELECT * FROM monitored_targets WHERE id = ?')) {
            return [[]];
        }
        return [[]];
    };
    try {
        const res = await send('POST', '/targets/999/check');
        assert.equal(res.status, 404);
        const json = await res.json();
        assert.equal(json.error.code, 'NOT_FOUND');
    } finally {
        pool.query = originalQuery;
    }
});

test('POST /targets/:id/check on disabled target -> 409 TARGET_DISABLED', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql) => {
        if (sql.includes('SELECT * FROM monitored_targets WHERE id = ?')) {
            return [[{ id: 1, name: 'Paused Target', is_enabled: 0, current_status: 'disabled' }]];
        }
        return [[]];
    };
    try {
        const res = await send('POST', '/targets/1/check');
        assert.equal(res.status, 409);
        const json = await res.json();
        assert.equal(json.error.code, 'TARGET_DISABLED');
    } finally {
        pool.query = originalQuery;
    }
});

test('GET /events returns 200 with joined target info and default pagination', async () => {
    const originalQuery = pool.query;
    let capturedSql;
    let capturedParams;
    pool.query = async (sql, params) => {
        capturedSql = sql;
        capturedParams = params;
        return [[
            {
                id: 101,
                target_id: 1,
                event_type: 'packet_loss',
                severity: 'critical',
                description: 'Packet loss reached 60%',
                occurred_at: '2026-11-09T00:00:00.000Z',
                resolved_at: null,
                is_resolved: 0,
                target_name: 'Primary Gateway',
                target_address: '192.168.1.1'
            }
        ]];
    };
    try {
        const res = await send('GET', '/events');
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.length, 1);
        assert.equal(data[0].id, 101);
        assert.equal(data[0].target_name, 'Primary Gateway');
        assert.match(capturedSql, /FROM events e/i);
        assert.match(capturedSql, /LEFT JOIN monitored_targets t ON e\.target_id = t\.id/i);
        assert.deepEqual(capturedParams, [100, 0]);
    } finally {
        pool.query = originalQuery;
    }
});

test('GET /events?targetId=1&isResolved=false respects query filters', async () => {
    const originalQuery = pool.query;
    let capturedSql;
    let capturedParams;
    pool.query = async (sql, params) => {
        capturedSql = sql;
        capturedParams = params;
        return [[]];
    };
    try {
        const res = await send('GET', '/events?targetId=1&isResolved=false');
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.length, 0);
        assert.match(capturedSql, /AND e\.target_id = \?/i);
        assert.match(capturedSql, /AND e\.is_resolved = \?/i);
        assert.deepEqual(capturedParams, [1, false, 100, 0]);
    } finally {
        pool.query = originalQuery;
    }
});
