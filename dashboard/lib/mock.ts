// MOCK DATA for step 5a. Replaced by the Supabase reader in step 5b. Every row here is sample data.
import type { Item, Status } from './queue'

// A fixed "now" so the screen is identical every time it is opened in mock mode.
export const MOCK_NOW = new Date('2026-11-05T15:00:00Z')

const rows: Item[] = [
  {
    id: 6, dedupe_key: 'stratify_fl:qbo-invoice-1015:void-or-correct',
    title: 'Void, credit or keep PR1ME invoice 1015 ($2,404)',
    summary: 'Invoices 1014 and 1015 are both $2,404 USD, both dated 30 Oct, with the identical line for the same week. 1014 is settled; 1015 is open and past due. Agents cannot change invoices, so it stays as it is until you decide.',
    entity: 'stratify_fl', raised_by: 'morning-brief',
    source_ref: 'QuickBooks Florida, invoices 1014 and 1015',
    blocks: 'Correcting October income in the Florida books, overstated by $2,404 if 1015 is a duplicate',
    evidence: 'confirmed', status: 'pending',
    raised_at: '2026-11-05T04:12:00Z', expires_at: '2026-11-19T04:12:00Z', decided_at: null, decision_note: null,
  },
  {
    id: 7, dedupe_key: 'stratify_fl:arr-phase1-step3:buy-twilio-numbers',
    title: 'Buy two Twilio business numbers, one US and one CA?',
    summary: "Step 3 of the Phase 1 build needs a US and a Canadian business number for Stratify's own Voice agent. You asked to be asked before any number is bought. Your 561 and 647 lines stay personal.",
    entity: 'stratify_fl', raised_by: 'morning-brief',
    source_ref: 'Growth plan, build order step 3',
    blocks: "Step 3: Stratify's own Voice agent, demo line and live transfer",
    evidence: 'confirmed', status: 'pending',
    raised_at: '2026-11-05T04:12:00Z', expires_at: '2026-11-19T04:12:00Z', decided_at: null, decision_note: null,
  },
  {
    id: 4, dedupe_key: 'prime:contractor-agreement:weekly-invoice-cadence',
    title: 'Confirm weekly invoicing in the PR1ME contractor agreement',
    summary: 'The signed agreement requires weekly invoices. Your own question about the cadence is still unanswered in email.',
    entity: 'prime', raised_by: 'morning-brief',
    source_ref: 'PR1ME mailbox, agreement thread',
    blocks: 'First weekly invoice cannot be drafted until the cadence is confirmed',
    evidence: 'visible_only', status: 'pending',
    raised_at: '2026-10-29T10:00:00Z', expires_at: '2026-11-12T10:00:00Z', decided_at: null, decision_note: null,
  },
  {
    id: 3, dedupe_key: 'dcl:fortress-site:send-launch-checklist',
    title: 'Send the launch checklist to John Fedele?',
    summary: 'He asked to talk before launch about website alignment. A draft checklist is ready in your drafts folder.',
    entity: 'dcl', raised_by: 'morning-brief',
    source_ref: 'DCL Fortress thread, 4 Nov',
    blocks: 'Draft sits unsent until you approve it',
    evidence: 'confirmed', status: 'deferred',
    raised_at: '2026-11-03T10:00:00Z', expires_at: '2026-11-17T10:00:00Z', decided_at: '2026-11-04T15:30:00Z', decision_note: 'After the Dubai demo prep.',
  },
  {
    id: 2, dedupe_key: 'stratify_ca:healix-medspa:send-scope-reply',
    title: 'Reply to the Healix Medspa scope question',
    summary: 'They asked whether the mobile app is in the first phase.',
    entity: 'stratify_ca', raised_by: 'morning-brief',
    source_ref: 'Stratify inbox, 30 Oct',
    blocks: 'Proposal v2 waits on the answer',
    evidence: 'confirmed', status: 'approved',
    raised_at: '2026-10-30T10:00:00Z', expires_at: '2026-11-13T10:00:00Z', decided_at: '2026-10-31T14:00:00Z', decision_note: 'Yes, phase one.',
  },
  {
    id: 1, dedupe_key: 'personal:gym-block:move-to-evening',
    title: 'Move Thursday gym block to the evening?',
    summary: null,
    entity: 'personal', raised_by: 'morning-brief',
    source_ref: null, blocks: null, evidence: 'inferred', status: 'rejected',
    raised_at: '2026-10-28T10:00:00Z', expires_at: '2026-11-11T10:00:00Z', decided_at: '2026-10-29T12:00:00Z', decision_note: null,
  },
]

// Module-level store: lives only as long as the server process. Fine for a mock, wrong for production.
const store = new Map(rows.map((r) => [r.id, r]))

export function mockList(): Item[] {
  return [...store.values()]
}

export function mockDecide(id: number, status: Extract<Status, 'approved' | 'rejected' | 'deferred'>, note: string) {
  const r = store.get(id)
  if (!r || (r.status !== 'pending' && r.status !== 'deferred')) return
  store.set(id, { ...r, status, decided_at: new Date().toISOString(), decision_note: note.trim() || null })
}
