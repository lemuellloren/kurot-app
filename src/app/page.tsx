'use client'
import { useState, useEffect } from 'react'
import { useKurotStore, CAT_COLORS, CAT_ICONS, CATEGORIES } from '@/store'
import { formatCurrency, pctOf } from '@/lib/utils'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { Plus, ChevronDown, ChevronUp, Trash2, Bell, X, TrendingUp, TrendingDown, Target, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

export default function Home() {
  const store = useKurotStore()
  const { userName, income, currency, envelopes, expandedEnvelopeId, nudges, goals, debts, recurringEntries } = store
  const [showAdd,    setShowAdd]    = useState(false)
  const [showNudges, setShowNudges] = useState(false)
  const [txnDesc,    setTxnDesc]    = useState<Record<string, string>>({})
  const [txnAmt,     setTxnAmt]     = useState<Record<string, string>>({})
  const [greeting,   setGreeting]   = useState('')
  const [currentMonth, setCurrentMonth] = useState('')
  const fp = (n: number) => formatCurrency(n, currency)

  useEffect(() => { store.generateNudges() }, [])

  useEffect(() => {
    const h = new Date().getHours()
    const timeOfDay = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
    setGreeting(userName ? `${timeOfDay}, ${userName}` : timeOfDay)
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const now = new Date()
    setCurrentMonth(`${months[now.getMonth()]} ${now.getFullYear()}`)
  }, [userName])

  const totalBudget = envelopes.reduce((s, e) => s + e.budget, 0)
  const totalSpent  = envelopes.reduce((s, e) => s + e.txns.reduce((a, t) => a + t.amt, 0), 0)
  const allocPct    = pctOf(totalBudget, income)
  const unread      = nudges.filter(n => !n.read)

  const statusLabel = totalSpent > totalBudget ? 'Over Budget!' : totalSpent / (totalBudget || 1) > 0.8 ? 'Watch Spending' : 'On Track'
  const statusCls   = totalSpent > totalBudget ? 'pill-over' : totalSpent / (totalBudget || 1) > 0.8 ? 'pill-warn' : 'pill-ok'

  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount)
  const activeDebts = debts.filter(d => d.status === 'active')
  const upcomingRecurring = recurringEntries.filter(r => {
    if (!r.active) return false
    const days = Math.ceil((new Date(r.nextDue).getTime() - Date.now()) / 86400000)
    return days <= 7 && days >= 0
  })

  return (
    <AppShell>
      <div className="p-3.5 lg:p-0 space-y-3 lg:space-y-6">

        {/* ── DESKTOP: Hero row ── */}
        <div className="hidden lg:block">
        {/* Nudge bar — mobile only, desktop handled by AppShell bell */}
          {unread.length > 0 && (
            <button
              onClick={() => setShowNudges(true)}
              className="lg:hidden w-full flex items-center gap-2 rounded-2xl px-4 py-2.5 text-left border mb-4"
              style={{ background: 'rgba(232,180,32,0.10)', borderColor: 'rgba(232,180,32,0.25)' }}
            >
              <Bell size={14} className="text-yellow-700 flex-shrink-0" />
              <span className="text-xs font-semibold text-green-900 flex-1">
                {unread.length} smart nudge{unread.length > 1 ? 's' : ''} — tap to review
              </span>
              <ChevronDown size={13} className="text-green-700/50" />
            </button>
          )}

          {/* Desktop summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Monthly Income',  value: fp(income),                      sub: currentMonth,          color: 'text-green-900',  bg: 'bg-green-800', light: false },
              { label: 'Total Budgeted',  value: fp(totalBudget),                 sub: `${allocPct}% of income`, color: 'text-green-900', bg: 'bg-white', light: true },
              { label: 'Total Spent',     value: fp(totalSpent),                  sub: `${pctOf(totalSpent, totalBudget)}% of budget`, color: 'text-red-600', bg: 'bg-white', light: true },
              { label: 'Remaining',       value: fp(Math.max(0, income - totalSpent)), sub: statusLabel,       color: income - totalSpent < 0 ? 'text-red-600' : 'text-green-700', bg: 'bg-white', light: true },
            ].map(m => (
              <div key={m.label} className={clsx('rounded-3xl p-5 shadow-card', m.bg)}>
                <p className={clsx('text-xs font-bold uppercase tracking-wide mb-2', m.light ? 'text-green-700/50' : 'text-white/60')}>{m.label}</p>
                <p className={clsx('text-2xl font-bold font-serif leading-tight', m.light ? m.color : 'text-white')}>{m.value}</p>
                <p className={clsx('text-xs mt-1', m.light ? 'text-green-700/40' : 'text-white/50')}>{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Desktop two-column layout */}
          <div className="grid grid-cols-3 gap-5">
            {/* Left col: Envelopes (wider) */}
            <div className="col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-lg text-green-900">My Envelopes</h2>
                <button onClick={() => setShowAdd(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Plus size={13} /> New Envelope
                </button>
              </div>

              {/* Allocation bar */}
              <div className="card px-4 py-3">
                <div className="flex justify-between text-xs text-green-700/60 font-semibold mb-2">
                  <span>Income allocation</span>
                  <span>{allocPct}% allocated</span>
                </div>
                <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-800 rounded-full transition-all duration-500" style={{ width: `${allocPct}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                {envelopes.map(env => (
                  <EnvelopeCard
                    key={env.id}
                    env={env}
                    fp={fp}
                    currency={currency}
                    expanded={expandedEnvelopeId === env.id}
                    txnDesc={txnDesc}
                    txnAmt={txnAmt}
                    setTxnDesc={setTxnDesc}
                    setTxnAmt={setTxnAmt}
                    store={store}
                  />
                ))}
              </div>
            </div>

            {/* Right col: Quick overview widgets */}
            <div className="space-y-4">
              {/* Goals snapshot */}
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-green-900 text-sm flex items-center gap-2"><Target size={14} className="text-green-700" /> Goals</p>
                  <a href="/goals" className="text-xs text-green-700 font-semibold hover:underline">View all</a>
                </div>
                {activeGoals.length === 0
                  ? <p className="text-xs text-green-700/40">No active goals</p>
                  : activeGoals.slice(0, 3).map(g => {
                    const pct = pctOf(g.currentAmount, g.targetAmount)
                    return (
                      <div key={g.id} className="mb-3 last:mb-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-green-900 truncate">{g.name}</span>
                          <span className="text-xs text-green-700/50 ml-2 flex-shrink-0">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[10px] text-green-700/40">{fp(g.currentAmount)}</span>
                          <span className="text-[10px] text-green-700/40">{fp(g.targetAmount)}</span>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              {/* Debt snapshot */}
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-green-900 text-sm flex items-center gap-2"><TrendingDown size={14} className="text-red-500" /> Debt</p>
                  <a href="/debt" className="text-xs text-green-700 font-semibold hover:underline">View all</a>
                </div>
                {activeDebts.length === 0
                  ? <p className="text-xs text-green-700/40">No active debts</p>
                  : activeDebts.slice(0, 3).map(d => {
                    const pct = pctOf(d.totalAmount - d.remainingAmount, d.totalAmount)
                    return (
                      <div key={d.id} className="mb-3 last:mb-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-green-900 truncate">{d.name}</span>
                          <span className={clsx('text-xs ml-2 flex-shrink-0 font-semibold', d.type === 'owe' ? 'text-red-500' : 'text-green-700')}>{fp(d.remainingAmount)}</span>
                        </div>
                        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.type === 'owe' ? '#dc2626' : '#1a6127' }} />
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              {/* Upcoming recurring */}
              <div className="card p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-green-900 text-sm flex items-center gap-2"><RefreshCw size={14} className="text-green-700" /> Upcoming</p>
                  <a href="/settings" className="text-xs text-green-700 font-semibold hover:underline">Manage</a>
                </div>
                {upcomingRecurring.length === 0
                  ? <p className="text-xs text-green-700/40">Nothing due this week</p>
                  : upcomingRecurring.slice(0, 4).map(r => {
                    const days = Math.ceil((new Date(r.nextDue).getTime() - Date.now()) / 86400000)
                    return (
                      <div key={r.id} className="flex justify-between items-center mb-2 last:mb-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', r.type === 'income' ? 'bg-green-500' : 'bg-red-400')} />
                          <span className="text-xs text-green-900 truncate">{r.name}</span>
                        </div>
                        <span className={clsx('text-[11px] font-semibold ml-2 flex-shrink-0', days === 0 ? 'text-red-500' : 'text-amber-600')}>
                          {days === 0 ? 'Today' : `${days}d`}
                        </span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (unchanged) ── */}
        <div className="lg:hidden space-y-3">
          {unread.length > 0 && (
            <button
              onClick={() => setShowNudges(true)}
              className="w-full flex items-center gap-2 rounded-2xl px-4 py-2.5 text-left border"
              style={{ background: 'rgba(232,180,32,0.12)', borderColor: 'rgba(232,180,32,0.3)' }}
            >
              <Bell size={14} className="text-yellow-700 flex-shrink-0" />
              <span className="text-xs font-semibold text-green-900 flex-1">
                {unread.length} smart nudge{unread.length > 1 ? 's' : ''} need your attention
              </span>
              <ChevronDown size={13} className="text-green-700/50" />
            </button>
          )}

          {/* Mobile Hero */}
          <div className="bg-green-800 rounded-[28px] p-5 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/[0.04] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-4 w-24 h-24 bg-white/[0.03] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <p className="text-white/50 text-[11px] tracking-widest uppercase mb-1" suppressHydrationWarning>{currentMonth}</p>
              <p className="text-white/70 text-sm font-medium mb-1" suppressHydrationWarning>{greeting} 👋</p>
              <p className="font-serif text-[36px] text-white leading-none tracking-tight">{fp(income)}</p>
              <p className="text-white/40 text-xs mt-2 italic">set aside a little for every need</p>
            </div>
            <span className={clsx('pill absolute top-5 right-5', statusCls)}>{statusLabel}</span>
          </div>

          {/* Mobile metrics */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Budgeted',  value: fp(totalBudget),                      cls: 'text-green-900' },
              { label: 'Spent',     value: fp(totalSpent),                       cls: 'text-red-600' },
              { label: 'Remaining', value: fp(Math.max(0, income - totalSpent)), cls: 'text-green-700' },
            ].map(m => (
              <div key={m.label} className="card px-3 py-2.5">
                <p className="text-[10px] font-bold text-green-700/50 uppercase tracking-wide mb-1">{m.label}</p>
                <p className={clsx('text-[13px] font-bold', m.cls)}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Mobile alloc bar */}
          <div className="card px-4 py-3">
            <div className="flex justify-between text-xs text-green-700/60 font-semibold mb-2">
              <span>Income allocation</span><span>{allocPct}% allocated</span>
            </div>
            <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-800 rounded-full transition-all duration-500" style={{ width: `${allocPct}%` }} />
            </div>
          </div>

          {/* Mobile envelopes */}
          <div>
            <div className="flex justify-between items-center mb-2.5 px-1">
              <span className="section-title">My Envelopes</span>
              <button onClick={() => setShowAdd(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                <Plus size={13} /> New Envelope
              </button>
            </div>
            <div className="space-y-2">
              {envelopes.map(env => (
                <EnvelopeCard
                  key={env.id}
                  env={env}
                  fp={fp}
                  currency={currency}
                  expanded={expandedEnvelopeId === env.id}
                  txnDesc={txnDesc}
                  txnAmt={txnAmt}
                  setTxnDesc={setTxnDesc}
                  setTxnAmt={setTxnAmt}
                  store={store}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && <AddEnvelopeModal onClose={() => setShowAdd(false)} />}

      {showNudges && (
        <Modal onClose={() => setShowNudges(false)}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl text-green-900">Smart Nudges</h3>
            <button onClick={() => { store.clearReadNudges(); setShowNudges(false) }} className="text-xs text-green-700/60 font-semibold">Clear all</button>
          </div>
          <div className="space-y-2">
            {unread.map(n => (
              <div key={n.id} className={clsx('rounded-2xl p-3 flex items-start gap-3 border', n.severity === 'danger' ? 'bg-red-50 border-red-200' : n.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200')}>
                <span className="text-sm mt-0.5 flex-shrink-0">{n.severity === 'danger' ? '🔴' : n.severity === 'warning' ? '🟡' : '🔵'}</span>
                <p className="text-xs text-green-900 flex-1 leading-relaxed">{n.message}</p>
                <button onClick={() => store.markNudgeRead(n.id)}><X size={13} className="text-green-700/40" /></button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </AppShell>
  )
}

function EnvelopeCard({ env, fp, currency, expanded, txnDesc, txnAmt, setTxnDesc, setTxnAmt, store }: any) {
  const spent    = env.txns.reduce((a: number, t: any) => a + t.amt, 0)
  const rem      = env.budget - spent
  const pct      = pctOf(spent, env.budget)
  const barColor = pct >= 100 ? '#dc2626' : pct >= 80 ? '#d97706' : '#1a7b2b'
  const remColor = rem < 0 ? '#dc2626' : rem < env.budget * 0.2 ? '#d97706' : '#1a7b2b'

  return (
    <div className={clsx('card overflow-hidden', expanded && 'ring-1 ring-green-800/20')}>
      <div className="p-4 cursor-pointer select-none" onClick={() => store.setExpandedEnvelope(expanded ? null : env.id)}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${CAT_COLORS[env.cat]}1a` }}>
              {CAT_ICONS[env.cat]}
            </div>
            <div>
              <p className="text-[15px] font-bold text-green-900 leading-tight">{env.name}</p>
              <p className="text-xs text-green-700/50 font-medium mt-0.5">{env.cat}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-bold text-green-900">{fp(spent)}</p>
            <p className="text-xs text-green-700/50 mt-0.5">of {fp(env.budget)}</p>
          </div>
        </div>
        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold" style={{ color: remColor }}>
            {rem < 0 ? `Over by ${fp(-rem)}` : `${fp(rem)} left`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-700/40">{pct}%</span>
            {expanded ? <ChevronUp size={14} className="text-green-700/40" /> : <ChevronDown size={14} className="text-green-700/40" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-green-800/10 p-4 bg-green-50/60">
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" placeholder="Description" value={txnDesc[env.id] ?? ''}
              onChange={e => setTxnDesc((p: any) => ({ ...p, [env.id]: e.target.value }))}
              onKeyDown={(e: any) => {
                if (e.key !== 'Enter') return
                const desc = txnDesc[env.id]?.trim(), amount = parseFloat(txnAmt[env.id] ?? '')
                if (!desc || isNaN(amount) || amount <= 0) return
                store.addTransaction(env.id, { name: desc, amt: amount, date: new Date().toISOString().split('T')[0] })
                setTxnDesc((p: any) => ({ ...p, [env.id]: '' }))
                setTxnAmt((p: any) => ({ ...p, [env.id]: '' }))
              }}
            />
            <input className="input flex-none w-24" type="number" placeholder="Amount" inputMode="decimal"
              value={txnAmt[env.id] ?? ''} onChange={e => setTxnAmt((p: any) => ({ ...p, [env.id]: e.target.value }))} />
            <button className="btn-primary py-2 px-3 text-xs whitespace-nowrap" onClick={() => {
              const desc = txnDesc[env.id]?.trim(), amount = parseFloat(txnAmt[env.id] ?? '')
              if (!desc || isNaN(amount) || amount <= 0) return
              store.addTransaction(env.id, { name: desc, amt: amount, date: new Date().toISOString().split('T')[0] })
              setTxnDesc((p: any) => ({ ...p, [env.id]: '' }))
              setTxnAmt((p: any) => ({ ...p, [env.id]: '' }))
            }}>+ Add</button>
          </div>
          {env.txns.length === 0
            ? <p className="text-xs text-green-700/40 py-1">No expenses yet</p>
            : <div className="space-y-0.5">
              {env.txns.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-1.5 border-b border-green-800/[0.07] last:border-0">
                  <div>
                    <span className="text-xs text-green-700/70">{t.name}</span>
                    {t.date && <span className="text-[10px] text-green-700/35 ml-2">{t.date}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-900">{fp(t.amt)}</span>
                    <button onClick={() => store.removeTransaction(env.id, t.id)}><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
          }
          <button onClick={() => store.removeEnvelope(env.id)} className="mt-3 text-xs text-red-400 font-semibold flex items-center gap-1">
            <Trash2 size={12} /> Delete envelope
          </button>
        </div>
      )}
    </div>
  )
}

function AddEnvelopeModal({ onClose }: { onClose: () => void }) {
  const store = useKurotStore()
  const [name, setName] = useState('')
  const [cat, setCat] = useState<any>('Food')
  const [budget, setBudget] = useState('')

  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) return
    store.addEnvelope({ name: name.trim(), cat, budget: parseFloat(budget) })
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="font-serif text-xl text-green-900 mb-4">New Envelope</h3>
      <div className="space-y-3">
        <div><label className="label">Envelope name</label><input className="input" placeholder="e.g. Groceries" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="label">Category</label>
          <select className="input" value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="label">Budget amount</label><input className="input" type="number" placeholder="5000" inputMode="numeric" value={budget} onChange={e => setBudget(e.target.value)} /></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="h-12 px-5 text-sm border border-green-800/20 rounded-2xl text-green-700/70 font-semibold">Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 h-12">Add envelope</button>
      </div>
    </Modal>
  )
}
