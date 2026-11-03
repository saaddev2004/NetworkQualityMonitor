import { test } from 'node:test';
import assert from 'node:assert/strict';
import { targetSchema, partialTargetSchema, validateMergedTarget } from '../src/middleware/validate.js';

const base = { name: 'Google', targetType: 'website', address: 'https://google.com', checkMethod: 'http' };

test('defaults are applied on create', () => {
    const out = targetSchema.parse(base);
    assert.equal(out.checkIntervalSeconds, 60);
    assert.equal(out.warningThresholdMs, 500);
    assert.equal(out.criticalThresholdMs, 1000);
    assert.equal(out.timeoutSeconds, 5);
});

test('warning threshold must be lower than critical', () => {
    const r = targetSchema.safeParse({ ...base, warningThresholdMs: 1000, criticalThresholdMs: 500 });
    assert.equal(r.success, false);
    assert.deepEqual(r.error.issues[0].path, ['warningThresholdMs']);
});

test('http address without scheme gets https:// added', () => {
    assert.equal(targetSchema.parse({ ...base, address: 'example.com' }).address, 'https://example.com');
    assert.equal(targetSchema.parse({ ...base, address: 'localhost:3000' }).address, 'https://localhost:3000');
});

test('http address: only http/https, no credentials', () => {
    assert.equal(targetSchema.safeParse({ ...base, address: 'ftp://example.com' }).success, false);
    assert.equal(targetSchema.safeParse({ ...base, address: 'https://user:pass@example.com' }).success, false);
    assert.equal(targetSchema.safeParse({ ...base, address: 'http://' }).success, false);
});

test('icmp address must be a hostname or IP', () => {
    const icmp = { name: 'Host', targetType: 'host', checkMethod: 'icmp' };
    assert.equal(targetSchema.safeParse({ ...icmp, address: '8.8.8.8' }).success, true);
    assert.equal(targetSchema.safeParse({ ...icmp, address: 'google.com' }).success, true);
    assert.equal(targetSchema.safeParse({ ...icmp, address: '::1' }).success, true);
    // argument injection / wrong format must be rejected
    assert.equal(targetSchema.safeParse({ ...icmp, address: '-c' }).success, false);
    assert.equal(targetSchema.safeParse({ ...icmp, address: '--help' }).success, false);
    assert.equal(targetSchema.safeParse({ ...icmp, address: 'http://google.com' }).success, false);
    assert.equal(targetSchema.safeParse({ ...icmp, address: 'google.com; ls' }).success, false);
    assert.equal(targetSchema.safeParse({ ...icmp, address: 'a b' }).success, false);
});

test('numbers must be whole and in range', () => {
    assert.equal(targetSchema.safeParse({ ...base, checkIntervalSeconds: 1.5 }).success, false);
    assert.equal(targetSchema.safeParse({ ...base, checkIntervalSeconds: 0 }).success, false);
    assert.equal(targetSchema.safeParse({ ...base, checkIntervalSeconds: 999999 }).success, false);
    assert.equal(targetSchema.safeParse({ ...base, timeoutSeconds: 500 }).success, false);
});

test('partial schema: needs at least one field and rejects unknown keys', () => {
    assert.equal(partialTargetSchema.safeParse({}).success, false);
    assert.equal(partialTargetSchema.safeParse({ hacker: 1 }).success, false);
    assert.equal(partialTargetSchema.safeParse({ name: 'New name' }).success, true);
});

const row = {
    name: 'Google', target_type: 'website', address: 'https://google.com', check_method: 'http',
    check_interval_seconds: 120, warning_threshold_ms: 200, critical_threshold_ms: 800, timeout_seconds: 7
};

test('PATCH merge keeps untouched fields (no reset to defaults)', () => {
    const r = validateMergedTarget(row, { name: 'Renamed' });
    assert.equal(r.success, true);
    assert.equal(r.data.name, 'Renamed');
    assert.equal(r.data.checkIntervalSeconds, 120);
    assert.equal(r.data.warningThresholdMs, 200);
    assert.equal(r.data.timeoutSeconds, 7);
});

test('PATCH merge still enforces cross-field rules', () => {
    // only warning is sent, but it must still be below the EXISTING critical (800)
    assert.equal(validateMergedTarget(row, { warningThresholdMs: 900 }).success, false);
    // switching to icmp with the old URL address must fail
    assert.equal(validateMergedTarget(row, { checkMethod: 'icmp' }).success, false);
    assert.equal(validateMergedTarget(row, { checkMethod: 'icmp', address: 'google.com' }).success, true);
});
