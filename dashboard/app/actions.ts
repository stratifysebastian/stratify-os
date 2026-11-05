'use server'
import { redirect } from 'next/navigation'
import { decideItem } from '@/lib/data'

const OK = new Set(['approved', 'rejected', 'deferred'])

export async function decide(form: FormData) {
  const id = Number(form.get('id'))
  const status = String(form.get('status'))
  const note = String(form.get('note') ?? '').slice(0, 500)
  const tab = String(form.get('tab') ?? '')
  if (!Number.isInteger(id) || !OK.has(status)) return
  const ok = await decideItem(id, status as 'approved' | 'rejected' | 'deferred', note)
  const back = tab === 'deferred' ? '/?tab=deferred' : '/'
  redirect(ok ? back : `${back}${back.includes('?') ? '&' : '?'}err=save`)
}
