'use client'
import { useKurotStore, CAT_COLORS } from '@/store'
import { formatCurrency } from '@/lib/utils'
import HeroCard from '@/components/HeroCard'
import { Clock, TrendingUp } from 'lucide-react'

export default function HistoryPage() {
  const { history, currency, saveSnapshot } = useKurotStore()
  const fp = (n: number) => formatCurrency(n, currency)

  return (
    <>
      <div className="p-4 space-y-4 lg:p-0 lg:space-y-5">
        <HeroCard eyebrow="Monthly History" title="Your spending over time"
          subtitle={`${history.length} month${history.length !== 1 ? 's' : ''} recorded`} />

        <div className="hidden lg:grid grid-cols-3 gap-4">
          {[
            { label: 'Months Recorded', value: history.length, sub: 'total snapshots' },
            { label: 'Avg Monthly Spend',
              value: history.length > 0
                ? fp(history.reduce((a, h) => a + h.snapshots.reduce((s, e) => s + e.spent, 0), 0) / history.length)
                : fp(0),
              sub: 'across all months' },
            { label: 'Total Tracked',
              value: fp(history.reduce((a, h) => a + h.snapshots.reduce((s, e) => s + e.spent, 0), 0)),
              sub: 'all time spending' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="section-title mb-2">{s.label}</p>
              <p className="font-serif text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="section-title">Snapshots</p>
          <button onClick={saveSnapshot} className="btn-secondary text-xs py-1.5 px-3">Save This Month</button>
        </div>

        {history.length === 0 ? (
          <div className="card p-10 text-center">
            <Clock size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No history yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Save a snapshot to start tracking monthly progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(h => {
              const ts          = h.snapshots.reduce((a, e) => a + e.spent, 0)
              const max         = Math.max(...h.snapshots.map(e => e.spent), 1)
              const savingsRate = h.income > 0 ? Math.max(0, Math.round((h.income - ts) / h.income * 100)) : 0
              return (
                <div key={h.month} className="card overflow-hidden">
                  <div className="px-4 pt-4 pb-3 flex justify-between items-start border-b" style={{ borderColor: 'var(--border-default)' }}>
                    <div>
                      <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{h.month}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {fp(ts)} spent · {savingsRate}% savings rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Income</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--brand-ink)' }}>{fp(h.income)}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    {h.snapshots.map(e => (
                      <div key={e.name} className="flex items-center gap-3">
                        <div className="w-[80px] text-xs font-medium truncate flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{e.name}</div>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.round(e.spent / max * 100)}%`, background: CAT_COLORS[e.cat] ?? '#6b7280' }} />
                        </div>
                        <div className="w-16 text-xs font-semibold text-right flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{fp(e.spent)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 flex justify-between items-center border-t"
                    style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card-alt)' }}>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} style={{ color: savingsRate > 20 ? 'var(--brand-ink)' : 'var(--text-muted)' }} />
                      <span className="text-xs font-semibold" style={{ color: savingsRate > 20 ? 'var(--brand-ink)' : 'var(--text-muted)' }}>
                        {savingsRate}% saved
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{fp(ts)} total</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}