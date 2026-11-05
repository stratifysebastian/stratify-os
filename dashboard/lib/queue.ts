// Shared types and pure helpers. No I/O here, so they can be tested without a database.
export type Status = 'pending' | 'approved' | 'rejected' | 'deferred' | 'expired'
export type Entity = 'stratify_fl' | 'stratify_ca' | 'prime' | 'dcl' | 'personal'
export type Evidence = 'confirmed' | 'visible_only' | 'inferred' | null

export type Item = {
  id: number
  dedupe_key: string
  title: string
  summary: string | null
  entity: Entity
  raised_by: string
  source_ref: string | null
  blocks: string | null
  evidence: Evidence
  status: Status
  raised_at: string // ISO
  expires_at: string | null // ISO
  decided_at: string | null
  decision_note: string | null
}

export const ENTITY_LABEL: Record<Entity, string> = {
  stratify_fl: 'Stratify FL',
  stratify_ca: 'Stratify CA',
  prime: 'PR1ME',
  dcl: 'DCL',
  personal: 'Personal',
}

const DAY = 86_400_000

// Whole days until expiry, rounded up so "0 days" never hides an item that still has hours.
export function daysLeft(expires: string | null, now: Date): number | null {
  if (!expires) return null
  return Math.max(0, Math.ceil((new Date(expires).getTime() - now.getTime()) / DAY))
}

// Share of the 14-day window still ahead, for the meter. Capped to [0,1].
export function windowShare(item: Pick<Item, 'raised_at' | 'expires_at'>, now: Date): number | null {
  if (!item.expires_at) return null
  const total = new Date(item.expires_at).getTime() - new Date(item.raised_at).getTime()
  if (total <= 0) return 0
  const left = new Date(item.expires_at).getTime() - now.getTime()
  return Math.min(1, Math.max(0, left / total))
}

// Soonest to expire first; items with no expiry go last; ties by oldest raised.
export function sortPending(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const ax = a.expires_at ? new Date(a.expires_at).getTime() : Infinity
    const bx = b.expires_at ? new Date(b.expires_at).getTime() : Infinity
    return ax - bx || new Date(a.raised_at).getTime() - new Date(b.raised_at).getTime()
  })
}

export type Tab = 'pending' | 'deferred' | 'decided'
export function inTab(i: Item, tab: Tab): boolean {
  if (tab === 'pending') return i.status === 'pending'
  if (tab === 'deferred') return i.status === 'deferred'
  return i.status === 'approved' || i.status === 'rejected' || i.status === 'expired'
}

export function counts(items: Item[]): Record<Tab, number> {
  return {
    pending: items.filter((i) => inTab(i, 'pending')).length,
    deferred: items.filter((i) => inTab(i, 'deferred')).length,
    decided: items.filter((i) => inTab(i, 'decided')).length,
  }
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

// The one line under the title: the finding, computed from the rows in view.
export function finding(pending: Item[], now: Date): string {
  if (pending.length === 0) return 'Nothing is waiting on you.'
  const first = sortPending(pending)[0]
  const d = daysLeft(first.expires_at, now)
  const head = `${plural(pending.length, 'item is', 'items are')} waiting on your yes or no`
  return d === null ? `${head}.` : `${head}. The first goes stale in ${plural(d, 'day', 'days')}.`
}
