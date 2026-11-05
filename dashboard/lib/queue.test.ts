import { test } from 'node:test'
import assert from 'node:assert/strict'
import { daysLeft, sortPending, finding, counts, type Item } from './queue.ts'

const now = new Date('2026-11-05T15:00:00Z')
const mk = (id: number, over: Partial<Item>): Item => ({
  id, dedupe_key: 'k' + id, title: 't', summary: null, entity: 'prime', raised_by: 'x', source_ref: null,
  blocks: null, evidence: null, status: 'pending', raised_at: '2026-11-05T04:00:00Z',
  expires_at: null, decided_at: null, decision_note: null, ...over,
})

test('daysLeft rounds up and floors at 0', () => {
  assert.equal(daysLeft('2026-11-19T04:00:00Z', now), 14)
  assert.equal(daysLeft('2026-11-05T16:00:00Z', now), 1)
  assert.equal(daysLeft('2026-11-01T00:00:00Z', now), 0)
  assert.equal(daysLeft(null, now), null)
})

test('sortPending: soonest expiry first, no expiry last', () => {
  const a = mk(1, { expires_at: '2026-11-19T00:00:00Z' })
  const b = mk(2, { expires_at: '2026-11-12T00:00:00Z' })
  const c = mk(3, { expires_at: null })
  assert.deepEqual(sortPending([c, a, b]).map((i) => i.id), [2, 1, 3])
})

test('finding and counts follow the rows given', () => {
  assert.equal(finding([], now), 'Nothing is waiting on you.')
  assert.match(finding([mk(1, { expires_at: '2026-11-12T00:00:00Z' })], now), /^1 item is waiting.*7 days\.$/)
  const items = [mk(1, {}), mk(2, { status: 'deferred' }), mk(3, { status: 'approved' }), mk(4, { status: 'expired' })]
  assert.deepEqual(counts(items), { pending: 1, deferred: 1, decided: 2 })
})
