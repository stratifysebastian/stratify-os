import { supabaseServer } from './supabase/server'
import { mockList, mockDecide, MOCK_NOW } from './mock'
import type { Item } from './queue'

export const isMock = process.env.MOCK === '1'
export const nowForScreen = () => (isMock ? MOCK_NOW : new Date())

const COLS = 'id,dedupe_key,title,summary,entity,raised_by,source_ref,blocks,evidence,status,raised_at,expires_at,decided_at,decision_note'

export async function listItems(): Promise<{ items: Item[]; error: boolean }> {
  if (isMock) return { items: mockList(), error: false }
  const sb = await supabaseServer()
  const { data, error } = await sb.from('approval_queue').select(COLS).limit(500)
  return { items: (data ?? []) as Item[], error: !!error }
}

// Only a pending or deferred item can be decided. Returns false if nothing changed (already decided, or no access).
export async function decideItem(id: number, status: 'approved' | 'rejected' | 'deferred', note: string): Promise<boolean> {
  if (isMock) { mockDecide(id, status, note); return true }
  const sb = await supabaseServer()
  const { data, error } = await sb
    .from('approval_queue')
    .update({ status, decided_at: new Date().toISOString(), decision_note: note.trim() || null })
    .eq('id', id)
    .in('status', ['pending', 'deferred'])
    .select('id')
  return !error && (data?.length ?? 0) === 1
}
