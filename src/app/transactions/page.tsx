'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Trash2, X, Receipt } from 'lucide-react'
import clsx from 'clsx'
import { useKurotStore, CAT_COLORS, CAT_ICONS } from '@/store'
import type { Category } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { collectTransactions, dayLabel } from '@/lib/tx'
import type { TxRow } from '@/lib/tx'
import MobileHeader from '@/components/MobileHeader'

export default function TransactionsPage() {
  const envelopes = useKurotStore((s) => s.envelopes)
  const currency = useKurotStore((s) => s.currency)
  const removeTransaction = useKurotStore((s) => s.removeTransaction)
  const fp = (n: number) => formatCurrency(n, currency)

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<'All' | Category>('All')

  const all = useMemo(() => collectTransactions(envelopes), [envelopes])
  const cats = useMemo(() => Array.from(new Set(all.map((t) => t.cat))), [all])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all.filter(
      (t) =>
        (cat === 'All' || t.cat === cat) &&
        (needle === '' || `${t.name} ${t.envName}`.toLowerCase().includes(needle)),
    )
  }, [all, q, cat])

  const total = filtered.reduce((a, t) => a + t.amt, 0)

  const groups = useMemo(() => {
    const out: { label: string; rows: TxRow[] }[] = []
    filtered.forEach((t) => {
      const label = dayLabel(t.date)
      const last = out[out.length - 1]
      if (last && last.label === label) last.rows.push(t)
      else out.push({ label, rows: [t] })
    })
    return out
  }, [filtered])

  return (
    <div className="p-4 lg:p-0 space-y-4 lg:max-w-3xl">
      <MobileHeader eyebrow="All activity" title="Transactions" />

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          className="input pl-10 pr-10 h-12"
          placeholder="Search transactions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button
            onClick={() => setQ('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category chips */}
      {cats.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
          {(['All', ...cats] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={clsx('chip flex items-center gap-1.5', cat === c && 'chip-active')}
            >
              {c !== 'All' && <span>{CAT_ICONS[c]}</span>}
              {c}
            </button>
          ))}
        </div>
      )}

      {all.length > 0 && (
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} ·{' '}
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {fp(total)}
          </span>{' '}
          spent
        </p>
      )}

      {/* List */}
      {all.length === 0 ? (
        <div className="card p-10 text-center">
          <Receipt size={30} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            No transactions yet
          </p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Expenses you log will show up here
          </p>
          <Link href="/" className="btn-primary inline-block">
            Go to Budget
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            No matches
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Try a different search or category
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.label}>
              <p className="section-title mb-2.5">{g.label}</p>
              <div className="space-y-2">
                {g.rows.map((t) => (
                  <div key={t.id} className="card px-3 py-3 flex items-center gap-3">
                    <div className="icon-tile" style={{ background: `${CAT_COLORS[t.cat]}1f` }}>
                      <span>{CAT_ICONS[t.cat]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {t.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {t.envName}
                      </p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                      -{fp(t.amt)}
                    </p>
                    <button
                      onClick={() => removeTransaction(t.envId, t.id)}
                      aria-label={`Delete ${t.name}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}