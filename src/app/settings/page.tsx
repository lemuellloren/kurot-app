'use client'
import { useState } from 'react'
import { useKurotStore, CATEGORIES, CAT_ICONS } from '@/store'
import { formatCurrency } from '@/lib/utils'
import dynamic from 'next/dynamic'
import HeroCard from '@/components/HeroCard'
import Modal from '@/components/Modal'
import { Plus, Trash2, RefreshCw, Bell, User, Sun, Moon, Monitor, AlertTriangle, RotateCcw, X } from 'lucide-react'
import clsx from 'clsx'
import Image from 'next/image'

const DataPortability = dynamic(() => import('@/components/DataPortability'), {
  ssr: false,
  loading: () => (
    <div className="card p-4 animate-pulse">
      <div className="h-4 rounded-lg w-1/2 mb-2" style={{ background: 'var(--bg-input)' }} />
      <div className="h-3 rounded-lg w-3/4" style={{ background: 'var(--bg-input)' }} />
    </div>
  ),
})

type Tab = 'profile' | 'budgets' | 'recurring' | 'nudges'

export default function SettingsPage() {
  const store = useKurotStore()
  const { userName, income, currency, categoryBudgets, recurringEntries, nudges, theme } = store
  const fp = (n: number) => formatCurrency(n, currency)

  const [tab,              setTab]              = useState<Tab>('profile')
  const [localName,        setLocalName]        = useState(userName)
  const [localIncome,      setLocalIncome]      = useState(String(income))
  const [localCurrency,    setLocalCurrency]    = useState(currency)
  const [showAddRecurring, setShowAddRecurring] = useState(false)
  const [saved,            setSaved]            = useState(false)
  const [showReset,        setShowReset]        = useState(false)

  const unread = nudges.filter(n => !n.read)

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile',   label: 'Profile' },
    { key: 'budgets',   label: 'Budgets' },
    { key: 'recurring', label: 'Recurring' },
    { key: 'nudges',    label: unread.length > 0 ? `Nudges (${unread.length})` : 'Nudges' },
  ]

  const handleSave = () => {
    store.setUserName(localName.trim())
    const inc = parseFloat(localIncome)
    if (!isNaN(inc) && inc > 0) store.setIncome(inc)
    store.setCurrency(localCurrency)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <div className="p-4 space-y-4 lg:p-0 lg:space-y-5">
        <HeroCard eyebrow="Settings" title="Customize Kurot" />

        {/* Tab bar */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-default)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 text-[11px] font-bold rounded-lg transition-all leading-tight"
              style={tab === t.key
                ? { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                : { color: 'var(--text-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className="space-y-3">
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: 'var(--brand-dim)', color: 'var(--brand-ink)' }}>
                  {localName ? localName[0].toUpperCase() : <User size={20} style={{ color: 'var(--brand-ink)' }} />}
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{localName || 'Your name'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Personal profile</p>
                </div>
              </div>
              <div className="space-y-3">
                <div><label className="label">Your first name</label>
                  <input className="input" placeholder="e.g. Maria" value={localName} onChange={e => setLocalName(e.target.value)} /></div>
                <div><label className="label">Monthly income</label>
                  <input className="input" type="number" inputMode="numeric" value={localIncome} onChange={e => setLocalIncome(e.target.value)} /></div>
                <div><label className="label">Currency</label>
                  <select className="input" value={localCurrency} onChange={e => setLocalCurrency(e.target.value)}>
                    {[['₱','Philippine Peso'],['$','US Dollar'],['€','Euro'],['₩','Korean Won'],['¥','Japanese Yen'],['£','British Pound']].map(([s, l]) => (
                      <option key={s} value={s}>{s}  {l}</option>
                    ))}
                  </select></div>
              </div>
              <button onClick={handleSave} className={clsx('btn-primary w-full h-11 mt-4 transition-all', saved && 'opacity-80')}>
                {saved ? '✓ Saved!' : 'Save changes'}
              </button>
            </div>

            <div className="card p-4">
              <p className="section-title mb-3">Appearance</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'light',  label: 'Light',  Icon: Sun },
                  { key: 'dark',   label: 'Dark',   Icon: Moon },
                  { key: 'system', label: 'System', Icon: Monitor },
                ] as const).map(opt => (
                  <button key={opt.key} onClick={() => store.setTheme(opt.key)}
                    className="flex flex-col items-center gap-2 py-3.5 rounded-xl border text-xs font-bold transition-all"
                    style={theme === opt.key
                      ? { background: 'var(--brand-dim)', borderColor: 'var(--brand-ink)', color: 'var(--brand-ink)' }
                      : { borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                    <opt.Icon size={18} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Budgets ── */}
        {tab === 'budgets' && (
          <div className="space-y-2">
            <p className="text-xs px-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Set a spending limit per category. You&apos;ll get a smart nudge when you&apos;re getting close.
            </p>
            {CATEGORIES.map(cat => (
              <CategoryBudgetRow key={cat} cat={cat} existing={categoryBudgets.find(b => b.category === cat)} currency={currency} />
            ))}
          </div>
        )}

        {/* ── Recurring ── */}
        {tab === 'recurring' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Income and expenses that repeat automatically.</p>
              <button onClick={() => setShowAddRecurring(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 flex-shrink-0 ml-2">
                <Plus size={12} /> Add
              </button>
            </div>
            {recurringEntries.length === 0 ? (
              <div className="card p-8 text-center">
                <RefreshCw size={26} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No recurring entries yet</p>
              </div>
            ) : recurringEntries.map(r => (
              <div key={r.id} className="card p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: r.type === 'income' ? 'var(--brand-dimmer)' : 'rgba(239,68,68,0.08)' }}>
                  <RefreshCw size={14} style={{ color: r.type === 'income' ? 'var(--brand-ink)' : '#ef4444' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
                    {r.type} · {r.frequency} · {fp(r.amount)}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Next: {r.nextDue}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => store.toggleRecurring(r.id)}
                    className="relative rounded-full transition-colors flex-shrink-0"
                    style={{ background: r.active ? 'var(--brand)' : 'var(--bg-input)', width: 36, height: 20 }}>
                    <span className="absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all"
                      style={{ left: r.active ? 18 : 3 }} />
                  </button>
                  <button onClick={() => store.removeRecurring(r.id)}>
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Nudges ── */}
        {tab === 'nudges' && (
          <div className="space-y-2">
            {/* Header row */}
            <div className="flex justify-between items-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Smart alerts — updates in real time.
              </p>
              <div className="flex items-center gap-2">
                {nudges.length > 0 && (
                  <button
                    onClick={() => nudges.forEach(n => store.removeNudge(n.id))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                    Clear all
                  </button>
                )}
                <button onClick={() => store.generateNudges()} className="btn-secondary text-xs py-1.5 px-3">Refresh</button>
              </div>
            </div>

            {/* Empty state */}
            {nudges.length === 0 ? (
              <div className="card p-8 text-center">
                <Bell size={26} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No nudges right now</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {nudges.map(n => (
                  <div key={n.id}
                    className={clsx(
                      'rounded-xl border p-3.5 flex items-start gap-3 transition-all',
                      n.read ? 'opacity-35' : ''
                    )}
                    style={{
                      background: n.severity === 'danger' ? 'rgba(239,68,68,0.06)' : n.severity === 'warning' ? 'rgba(251,191,36,0.06)' : 'rgba(64,255,225,0.05)',
                      borderColor: n.severity === 'danger' ? 'rgba(239,68,68,0.15)' : n.severity === 'warning' ? 'rgba(251,191,36,0.15)' : 'rgba(64,255,225,0.10)',
                    }}>
                    <span className="text-base flex-shrink-0 mt-0.5">
                      {n.severity === 'danger' ? '🔴' : n.severity === 'warning' ? '🟡' : '🔵'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{n.date}</p>
                    </div>
                    {/* Per-nudge dismiss */}
                    {!n.read && (
                      <button
                        onClick={() => store.removeNudge(n.id)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'var(--bg-input)' }}
                        title="Dismiss" aria-label="Dismiss nudge">
                        <X size={13} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DataPortability />

        {/* Reset data */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <RotateCcw size={16} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Reset All Data</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Wipe everything and start fresh</p>
              </div>
            </div>
            <button
              onClick={() => setShowReset(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.20)' }}>
              Reset
            </button>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            This will permanently delete all your envelopes, transactions, goals, debts, history, and settings. This action cannot be undone.
          </p>
        </div>

        {/* About */}
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-default)' }}>
              <Image src="/logo-icon.svg" alt="Kurot" width={36} height={36} />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Kurot</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Version 1.0.0 · Offline · Open source</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Inspired by the Filipino tradition of <em>magkurot ng pera</em> — setting aside small portions of money for specific needs. All data stays on your device.
          </p>
          <p className="text-xs italic mt-2" style={{ color: 'var(--text-muted)' }}>&ldquo;Set aside a little for every need.&rdquo;</p>
        </div>
      </div>

      {showAddRecurring && <AddRecurringModal onClose={() => setShowAddRecurring(false)} />}
      {showReset && <ResetModal onClose={() => setShowReset(false)} />}
    </>
  )
}

function CategoryBudgetRow({ cat, existing, currency }: any) {
  const store = useKurotStore()
  const [limit,   setLimit]   = useState(String(existing?.limit ?? ''))
  const [alertAt, setAlertAt] = useState(String(existing?.alertAt ?? '80'))
  const [editing, setEditing] = useState(false)

  return (
    <div className="card p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{CAT_ICONS[cat]}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cat}</p>
            {existing && !editing && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Limit: {formatCurrency(existing.limit, currency)} · Alert at {existing.alertAt}%
              </p>
            )}
            {!existing && !editing && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>No limit set</p>}
          </div>
        </div>
        <button onClick={() => setEditing(v => !v)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--brand-dimmer)', color: 'var(--brand-ink)' }}>
          {editing ? 'Cancel' : existing ? 'Edit' : 'Set limit'}
        </button>
      </div>
      {editing && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Spending limit</label>
              <input className="input" type="number" placeholder="10000" inputMode="numeric" value={limit} onChange={e => setLimit(e.target.value)} /></div>
            <div><label className="label">Alert at (%)</label>
              <input className="input" type="number" placeholder="80" min="1" max="100" value={alertAt} onChange={e => setAlertAt(e.target.value)} /></div>
          </div>
          <div className="flex gap-2">
            {existing && (
              <button onClick={() => { store.removeCategoryBudget(cat); setEditing(false) }}
                className="h-9 px-3 text-xs font-semibold rounded-xl border"
                style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.20)' }}>Remove</button>
            )}
            <button onClick={() => {
              const l = parseFloat(limit); const a = parseFloat(alertAt)
              if (!isNaN(l) && l > 0) { store.setCategoryBudget(cat, l, isNaN(a) ? 80 : Math.min(100, Math.max(1, a))); setEditing(false) }
            }} className="btn-primary flex-1 h-9 text-xs">Save limit</button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddRecurringModal({ onClose }: { onClose: () => void }) {
  const store = useKurotStore()
  const [name, setName] = useState(''); const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState<any>('Other')
  const [frequency, setFrequency] = useState<any>('monthly')
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0])

  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(amount))) return
    store.addRecurring({ name: name.trim(), amount: parseFloat(amount), type, category, frequency, nextDue, active: true }); onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="font-serif text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Recurring Entry</h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          {(['income', 'expense'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all capitalize"
              style={type === t
                ? { background: 'var(--brand)', color: 'var(--brand-text)', borderColor: 'var(--brand)' }
                : { borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>
              {t}
            </button>
          ))}
        </div>
        <div><label className="label">Name</label>
          <input className="input" placeholder="e.g. Netflix, Salary" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="label">Amount</label>
          <input className="input" type="number" placeholder="1000" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label className="label">Frequency</label>
            <select className="input" value={frequency} onChange={e => setFrequency(e.target.value)}>
              {['daily','weekly','monthly','yearly'].map(f => <option key={f}>{f}</option>)}
            </select></div>
        </div>
        <div><label className="label">Next due date</label>
          <input className="input" type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} /></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="h-11 px-5 text-sm font-semibold rounded-xl border"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 h-11">Add recurring</button>
      </div>
    </Modal>
  )
}

function ResetModal({ onClose }: { onClose: () => void }) {
  const store = useKurotStore()
  const [confirm, setConfirm] = useState('')
  const [resetting, setResetting] = useState(false)
  const isConfirmed = confirm.toLowerCase() === 'reset'

  const handleReset = () => {
    if (!isConfirmed) return
    setResetting(true)
    setTimeout(() => {
      store.resetAllData()
      // Clear persisted storage
      try { localStorage.removeItem('kurot_v2') } catch {}
      window.location.href = '/'
    }, 600)
  }

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
          <AlertTriangle size={24} style={{ color: '#ef4444' }} />
        </div>
        <h3 className="font-serif text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Reset All Data
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This will permanently delete everything — envelopes, transactions, goals, debts, history, and settings.
        </p>
      </div>

      {/* What gets deleted */}
      <div className="rounded-xl p-3 mb-4 space-y-1.5"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
        {[
          'All envelopes & transactions',
          'All goals & contributions',
          'All debts & payments',
          'Monthly history snapshots',
          'Recurring entries',
          'Your name, income & preferences',
        ].map(item => (
          <div key={item} className="flex items-center gap-2">
            <Trash2 size={11} style={{ color: '#ef4444' }} className="flex-shrink-0" />
            <span className="text-xs" style={{ color: '#ef4444' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Confirmation input */}
      <div className="mb-5">
        <label className="label">Type <span className="font-black" style={{ color: '#ef4444' }}>reset</span> to confirm</label>
        <input
          className="input"
          placeholder="reset"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
          style={isConfirmed ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' } : {}}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="h-11 px-5 text-sm font-semibold rounded-xl border flex-1"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={!isConfirmed || resetting}
          className="h-11 px-5 text-sm font-bold rounded-xl flex-1 transition-all flex items-center justify-center gap-2"
          style={{
            background: isConfirmed && !resetting ? '#ef4444' : 'rgba(239,68,68,0.15)',
            color: isConfirmed && !resetting ? '#fff' : 'rgba(239,68,68,0.4)',
            cursor: isConfirmed && !resetting ? 'pointer' : 'not-allowed',
          }}>
          {resetting ? (
            <>
              <RotateCcw size={14} className="animate-spin" /> Resetting…
            </>
          ) : (
            <>
              <AlertTriangle size={14} /> Reset everything
            </>
          )}
        </button>
      </div>
    </Modal>
  )
}