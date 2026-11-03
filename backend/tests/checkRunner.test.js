import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import pool from '../src/config/db.js';
import { checkAndRecord, evaluateStatus, REPEATED_FAILURE_THRESHOLD } from '../src/services/checkRunner.js';
import { scheduleTarget, unscheduleTarget, isScheduled } from '../src/scheduler/scheduler.js';

// ---------- a tiny in-memory fake of the database ----------
let db;
const resetDb = (overrides = {}) => {
    db = {
        target: {
            id: 1, name: 'Test target', address: baseUrl, check_method: 'http',
            check_interval_seconds: 3600, warning_threshold_ms: 100, critical_threshold_ms: 300,
            timeout_seconds: 5, is_enabled: 1, current_status: 'unknown', ...overrides
        },
        results: [],
        events: []
    };
};

const realQuery = pool.query;
const fakeQuery = async (sql, params = []) => {
    const q = sql.replace(/\s+/g, ' ').trim();
    if (q.startsWith('SELECT * FROM monitored_targets WHERE id')) {
        return [db.target && Number(params[0]) === db.target.id ? [{ ...db.target }] : []];
    }
    if (q.startsWith('SELECT * FROM monitored_targets WHERE is_enabled')) {
        return [db.target ? [{ ...db.target }] : []];
    }
    if (q.includes('INSERT INTO monitoring_results')) {
        const [target_id, is_available, response_time_ms, http_status_code, result_status, error_type, error_message] = params;
        db.results.push({ target_id, is_available: Boolean(is_available), response_time_ms, http_status_code, result_status, error_type, error_message });
        return [{ insertId: db.results.length }];
    }
    if (q.startsWith('UPDATE monitored_targets SET current_status')) {
        if (db.target.is_enabled) db.target.current_status = params[0];
        return [{ affectedRows: 1 }];
    }
    if (q.includes('INSERT INTO events')) {
        const [target_id, event_type, severity, description, resolved] = params;
        db.events.push({ target_id, event_type, severity, description, is_resolved: Boolean(resolved) });
        return [{ insertId: db.events.length }];
    }
    if (q.startsWith('UPDATE events SET is_resolved')) {
        const [, keepType] = params;
        let n = 0;
        for (const e of db.events) {
            if (!e.is_resolved && (keepType === null || e.event_type !== keepType)) { e.is_resolved = true; n++; }
        }
        return [{ affectedRows: n }];
    }
    if (q.startsWith('SELECT is_available FROM monitoring_results')) {
        const limit = params[1];
        return [db.results.slice().reverse().slice(0, limit).map((r) => ({ is_available: r.is_available }))];
    }
    throw new Error('Fake DB: unhandled SQL: ' + q);
};

// ---------- a real local HTTP server we can slow down / break ----------
let server;
let baseUrl;
let mode = { status: 200, delay: 0 };

before(async () => {
    server = http.createServer((req, res) => {
        setTimeout(() => { res.statusCode = mode.status; res.end('ok'); }, mode.delay);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/`;
    pool.query = fakeQuery;
});

after(async () => {
    unscheduleTarget(1); // never leave a timer running, or the test process cannot exit
    pool.query = realQuery;
    await new Promise((resolve) => server.close(resolve));
    await pool.end().catch(() => {});
});

beforeEach(() => {
    mode = { status: 200, delay: 0 };
    resetDb();
});

const check = async (m) => {
    mode = m;
    const out = await checkAndRecord(1);
    assert.equal(out.outcome, 'done');
    return out;
};
const active = () => db.events.filter((e) => !e.is_resolved);
const types = () => db.events.map((e) => e.event_type);

// ---------- tests ----------

test('evaluateStatus boundaries', () => {
    const t = { warning_threshold_ms: 100, critical_threshold_ms: 300 };
    assert.equal(evaluateStatus({ isAvailable: false, responseTimeMs: null }, t), 'offline');
    assert.equal(evaluateStatus({ isAvailable: true, responseTimeMs: 99 }, t), 'online');
    assert.equal(evaluateStatus({ isAvailable: true, responseTimeMs: 100 }, t), 'warning');
    assert.equal(evaluateStatus({ isAvailable: true, responseTimeMs: 299 }, t), 'warning');
    assert.equal(evaluateStatus({ isAvailable: true, responseTimeMs: 300 }, t), 'critical');
});

test('first check saves history + status but raises NO event', async () => {
    const out = await check({ status: 200, delay: 0 });
    assert.equal(out.status, 'online');
    assert.equal(db.results.length, 1);
    assert.equal(db.target.current_status, 'online');
    assert.equal(db.events.length, 0);
});

test('online -> warning -> critical -> online: events open, supersede, then resolve', async () => {
    await check({ status: 200, delay: 0 });               // online (first check, no event)
    await check({ status: 200, delay: 150 });             // warning
    assert.deepEqual(types(), ['warning']);
    assert.equal(active().length, 1);

    await check({ status: 200, delay: 400 });             // critical: warning event is superseded
    assert.deepEqual(types(), ['warning', 'critical']);
    assert.deepEqual(active().map((e) => e.event_type), ['critical']);

    await check({ status: 200, delay: 0 });               // back to online
    assert.deepEqual(types(), ['warning', 'critical', 'recovery']);
    assert.equal(active().length, 0, 'nothing should stay active after recovery');
});

test('offline -> online: offline event resolved + recovery event', async () => {
    await check({ status: 200, delay: 0 });
    const down = await check({ status: 500, delay: 0 });  // HTTP 500 = application failure = offline
    assert.equal(down.status, 'offline');
    assert.equal(db.events[0].event_type, 'offline');
    assert.equal(db.events[0].severity, 'critical');

    await check({ status: 200, delay: 0 });
    assert.equal(db.events.find((e) => e.event_type === 'offline').is_resolved, true);
    assert.equal(types().at(-1), 'recovery');
    assert.equal(active().length, 0);
});

test('offline -> slow: gets a recovery event AND a warning event', async () => {
    await check({ status: 200, delay: 0 });
    await check({ status: 500, delay: 0 });
    await check({ status: 200, delay: 150 });
    assert.deepEqual(types(), ['offline', 'recovery', 'warning']);
    assert.deepEqual(active().map((e) => e.event_type), ['warning']);
});

test('repeated_failure is raised exactly once per outage', async () => {
    await check({ status: 200, delay: 0 });
    for (let i = 0; i < REPEATED_FAILURE_THRESHOLD + 2; i++) await check({ status: 500, delay: 0 });
    assert.equal(types().filter((t) => t === 'repeated_failure').length, 1);

    await check({ status: 200, delay: 0 });               // outage over -> everything resolved
    assert.equal(active().length, 0);

    // a NEW outage can raise it again
    for (let i = 0; i < REPEATED_FAILURE_THRESHOLD; i++) await check({ status: 500, delay: 0 });
    assert.equal(types().filter((t) => t === 'repeated_failure').length, 2);
});

test('disabled and missing targets are not checked', async () => {
    resetDb({ is_enabled: 0, current_status: 'disabled' });
    assert.equal((await checkAndRecord(1)).outcome, 'disabled');
    assert.equal(db.results.length, 0);

    assert.equal((await checkAndRecord(999)).outcome, 'missing');
});

test('overlapping checks of the same target are skipped ("busy")', async () => {
    mode = { status: 200, delay: 200 };
    const [a, b] = await Promise.all([checkAndRecord(1), checkAndRecord(1)]);
    assert.deepEqual([a.outcome, b.outcome].sort(), ['busy', 'done']);
    assert.equal(db.results.length, 1);
});

test('a target disabled mid-check keeps its disabled status', async () => {
    mode = { status: 200, delay: 150 };
    const p = checkAndRecord(1);
    setTimeout(() => { db.target.is_enabled = 0; db.target.current_status = 'disabled'; }, 30);
    await p;
    assert.equal(db.target.current_status, 'disabled');
});

test('scheduler: string id (as from req.params) really stops the job', async () => {
    const target = { ...db.target, id: 1 };               // numeric id, like a DB row
    scheduleTarget(target);
    assert.equal(isScheduled(1), true);

    unscheduleTarget('1');                                // string id, like DELETE /targets/:id
    assert.equal(isScheduled(1), false, 'job must be stopped even when id is a string');
    await new Promise((r) => setTimeout(r, 300));         // let the immediate first run finish
});

test('scheduler: a job for a deleted target stops itself', async () => {
    db.target = null;                                     // row no longer exists in the DB
    scheduleTarget({ id: 1, name: 'x', is_enabled: 1, check_interval_seconds: 1 });
    assert.equal(isScheduled(1), true);                   // scheduled...
    await new Promise((r) => setTimeout(r, 200));         // ...first immediate run finds no row
    assert.equal(isScheduled(1), false, 'job must stop itself when the target is gone');
});
