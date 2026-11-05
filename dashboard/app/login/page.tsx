import { sendLink } from './actions'

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; err?: string }> }) {
  const sp = await searchParams
  return (
    <>
      <header className="bar"><span className="brand">Stratify OS</span><span className="scope">Sign in</span></header>
      <main className="wrap">
        <h1>Sign in</h1>
        {sp.sent ? (
          <p className="finding">If that address is allowed, a sign-in link is on its way. Open it on this same phone or browser.</p>
        ) : (
          <>
            <p className="finding">Enter your email and we send a one-time link.{sp.err ? ' That link did not work. Request a new one.' : ''}</p>
            <form action={sendLink} className="decide">
              <input className="field" type="email" name="email" required autoComplete="email" placeholder="you@example.com" aria-label="Email" />
              <button className="btn primary">Send sign-in link</button>
            </form>
          </>
        )}
      </main>
    </>
  )
}
