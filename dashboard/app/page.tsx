import Link from 'next/link'
import { decide } from './actions'
import { isMock, listItems, nowForScreen } from '@/lib/data'
import { ENTITY_LABEL, counts, daysLeft, finding, inTab, plural, sortPending, windowShare, type Item, type Tab } from '@/lib/queue'

const TABS: { id: Tab; label: string }[] = [
  { id: 'pending', label: 'Waiting' },
  { id: 'deferred', label: 'Deferred' },
  { id: 'decided', label: 'Decided' },
]
const EVIDENCE = { confirmed: 'Confirmed', visible_only: 'Visible only', inferred: 'Inferred' } as const
const day = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'America/Toronto' })

function Mark() {
  // Three bars shortening downward: a queue. Ink only, no tile.
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 5h16M3 11h11M3 17h6" />
    </svg>
  )
}

function Card({ item, now, tab }: { item: Item; now: Date; tab: Tab }) {
  const left = daysLeft(item.expires_at, now)
  const share = windowShare(item, now)
  const open = item.status === 'pending' || item.status === 'deferred'
  return (
    <li className="card">
      <div className="meta">
        <span>{ENTITY_LABEL[item.entity]}</span>
        {item.evidence && <span>{EVIDENCE[item.evidence]}</span>}
      </div>
      <h2>{item.title}</h2>
      {item.summary && <p className="sum">{item.summary}</p>}
      {item.blocks && (
        <p className="blocks"><span className="k">Blocks</span> {item.blocks}</p>
      )}
      {open && (
        <div className="expiry">
          <div className="expiry-row">
            <span className="num">{left === null ? '—' : plural(left, 'day', 'days')}</span>
            <span className="grey">{left === null ? 'no expiry' : 'left'} · raised {day(item.raised_at)}</span>
          </div>
          {share !== null && <div className="meter" role="img" aria-label={`${Math.round(share * 100)}% of the window left`}><i style={{ width: `${share * 100}%` }} /></div>}
        </div>
      )}
      {item.status === 'deferred' && item.decision_note && <p className="note-line"><span className="k">Your note</span> {item.decision_note}</p>}
      {!open && (
        <p className="decided">
          <b className={item.status}>{item.status === 'expired' ? 'Expired' : item.status === 'approved' ? 'Approved' : 'Rejected'}</b>
          <span className="grey"> {item.decided_at ? day(item.decided_at) : ''}</span>
          {item.decision_note ? <span> · {item.decision_note}</span> : null}
        </p>
      )}
      {open && (
        <form action={decide} className="decide">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="tab" value={tab} />
          <input className="field" name="note" maxLength={500} placeholder="Add a note (optional)" aria-label={`Note for: ${item.title}`} />
          <div className="actions">
            <button className="btn primary" name="status" value="approved">Approve</button>
            <button className="btn" name="status" value="rejected">Reject</button>
            {tab === 'pending' && <button className="btn" name="status" value="deferred">Defer</button>}
          </div>
        </form>
      )}
    </li>
  )
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; err?: string }> }) {
  const sp = await searchParams
  const tab: Tab = sp.tab === 'deferred' || sp.tab === 'decided' ? sp.tab : 'pending'
  const now = nowForScreen()
  const { items: all, error } = await listItems()
  const c = counts(all)
  const rows = all.filter((i) => inTab(i, tab))
  const shown =
    tab === 'decided'
      ? [...rows].sort((a, b) => +new Date(b.decided_at ?? 0) - +new Date(a.decided_at ?? 0))
      : sortPending(rows)

  return (
    <>
      <header className="bar">
        <span className="brand"><Mark /> Stratify OS</span>
        <span className="scope">
          Approvals
          {!isMock && (
            <form action="/auth/signout" method="post" className="signout"><button>Sign out</button></form>
          )}
        </span>
      </header>
      <main className="wrap">
        {isMock && <p className="banner">Sample data. Nothing here is connected to the database.</p>}
        {sp.err === 'save' && <p className="banner">That decision did not save. It may already be decided. Reload and try again.</p>}
        <h1>Waiting on you</h1>
        <p className="finding">{finding(all.filter((i) => inTab(i, 'pending')), now)}</p>

        <nav className="tabs" aria-label="Queue views">
          {TABS.map((t) => (
            <Link key={t.id} href={t.id === 'pending' ? '/' : `/?tab=${t.id}`} className={t.id === tab ? 'on' : ''} aria-current={t.id === tab ? 'page' : undefined}>
              {t.label} <span className="num grey">{c[t.id]}</span>
            </Link>
          ))}
        </nav>

        {error ? (
          <div className="empty">Couldn&apos;t load the queue. <Link href={tab === 'pending' ? '/' : `/?tab=${tab}`}>Retry</Link></div>
        ) : shown.length === 0 ? (
          <div className="empty">
            {tab === 'pending' ? 'Nothing is waiting on you.' : tab === 'deferred' ? 'No deferred items.' : 'No decisions yet.'}
          </div>
        ) : (
          <ul className="list">
            {shown.map((i) => <Card key={i.id} item={i} now={now} tab={tab} />)}
          </ul>
        )}
      </main>
    </>
  )
}
