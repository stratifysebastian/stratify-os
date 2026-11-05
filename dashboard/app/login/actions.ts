'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export async function sendLink(form: FormData) {
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 254)
  if (email.includes('@')) {
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? 'https'
    const sb = await supabaseServer()
    // shouldCreateUser false: only a user that already exists can get a link. The reply below is the same either way.
    await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${proto}://${host}/auth/callback` } })
  }
  redirect('/login?sent=1')
}
