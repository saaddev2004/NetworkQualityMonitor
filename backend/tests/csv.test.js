import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, toCsv } from '../src/utils/csv.js';

test('formula injection is neutralised for every text cell', () => {
    for (const bad of ['=1+1', '+1', '-1+2', '@SUM(A1)', '\tcmd']) {
        assert.ok(csvCell(bad).startsWith("'"), `${JSON.stringify(bad)} should be prefixed`);
    }
});

test('real numbers (even negative) are not modified', () => {
    assert.equal(csvCell(-5), '-5');
    assert.equal(csvCell(12.5), '12.5');
});

test('commas, quotes and newlines are quoted/escaped', () => {
    assert.equal(csvCell('a,b'), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell('line1\nline2'), '"line1\nline2"');
});

test('null/undefined become empty, dates become ISO strings', () => {
    assert.equal(csvCell(null), '');
    assert.equal(csvCell(undefined), '');
    assert.equal(csvCell(new Date('2026-11-04T10:00:00Z')), '2026-11-04T10:00:00.000Z');
});

test('header is written even when there are no rows', () => {
    assert.equal(toCsv([], ['id', 'name']), 'id,name');
    assert.equal(toCsv([{ id: 1, name: '=evil()' }], ['id', 'name']), "id,name\n1,'=evil()");
});
