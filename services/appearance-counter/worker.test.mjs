import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './worker.js';
function environment() {
  const sql = new DatabaseSync(':memory:'); sql.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  return { ALLOWED_ORIGINS: 'https://ancientkira21.github.io', DB: { prepare(query) { let values = []; return { bind(...next) { values = next; return this; }, run() { return sql.prepare(query).run(...values); }, all() { return { results: sql.prepare(query).all(...values) }; } }; } } };
}
const origin = 'https://ancientkira21.github.io';
const one = 'a5e42eef-ec18-4ab5-8522-c922cdd1e566';
const two = 'b5e42eef-ec18-4ab5-8522-c922cdd1e566';
function choose(env, voter, choice) { return worker.fetch(new Request('https://counter.example/choice', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ voter, choice }) }), env); }
test('one saved vote per browser; switching moves it and totals remain shared', async () => {
  const env = environment();
  assert.deepEqual((await (await worker.fetch(new Request('https://counter.example/counts'), env)).json()).counts, { enchanted: 0, chrisglass: 0, material: 0, materialglass: 0 });
  await choose(env, one, 'enchanted'); await choose(env, one, 'enchanted');
  assert.deepEqual((await (await choose(env, two, 'chrisglass')).json()).counts, { enchanted: 1, chrisglass: 1, material: 0, materialglass: 0 });
  assert.deepEqual((await (await choose(env, one, 'chrisglass')).json()).counts, { enchanted: 0, chrisglass: 2, material: 0, materialglass: 0 });
});
test('rejects untrusted origins, malformed votes and oversized bodies', async () => {
  const env = environment();
  assert.equal((await worker.fetch(new Request('https://counter.example/counts', { headers: { Origin: 'https://evil.example' } }), env)).status, 403);
  assert.equal((await choose(env, one, 'fake')).status, 400);
  assert.equal((await choose(env, 'not-a-uuid', 'enchanted')).status, 400);
  assert.equal((await worker.fetch(new Request('https://counter.example/choice', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: 'x'.repeat(1025) }), env)).status, 413);
  assert.deepEqual((await (await worker.fetch(new Request('https://counter.example/counts'), env)).json()).counts, { enchanted: 0, chrisglass: 0, material: 0, materialglass: 0 });
});
test('database outage never returns fake counts', async () => {
  const env = { DB: { prepare() { throw new Error('offline'); } } };
  const response = await worker.fetch(new Request('https://counter.example/counts'), env);
  assert.equal(response.status, 503); assert.equal((await response.json()).counts, undefined);
});

test('Material choices use the same one-vote rule', async () => { const env=environment(); await choose(env,one,'material'); const response=await choose(env,one,'materialglass'); assert.deepEqual((await response.json()).counts,{enchanted:0,chrisglass:0,material:0,materialglass:1}); });
