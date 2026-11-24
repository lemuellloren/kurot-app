'use client'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import clsx from 'clsx'
import {
  Plus, ChevronDown, ChevronUp, ChevronRight, Trash2,
  TrendingUp, TrendingDown, Sparkles, Wallet, Receipt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useKurotStore, CAT_COLORS, CAT_ICONS, CATEGORIES } from '@/store'
import { formatCurrency, pctOf } from '@/lib/utils'
import { collectTransactions, dayLabel } from '@/lib/tx'
import Modal from '@/components/Modal'
import Money from '@/components/Money'
import MobileHeader from '@/components/MobileHeader'
import NudgeList from '@/components/NudgeList'

const GettingStarted = dynamic(() => import('@/components/GettingStarted'), { ssr: false })

export default function Home() {
  const store = useKurotStore()
  const {
    userName, income, currency, envelopes, expandedEnvelopeId,
    nudges, goals, debts, recurringEntries, history,
  } = store

  const [showAdd, setShowAdd] = useState(false)
  const [showNudges, setShowNudges] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [txnDesc, setTxnDesc] = useState<Record<string, string>>({})
  const [txnAmt, setTxnAmt] = useState<Record<string, string>>({})
  const [tod, setTod] = useState('Welcome back')
  const [currentMonth, setCurrentMonth] = useState('')
  const fp = (n: number) => formatCurrency(n, currency)

  // Show onboarding for new users (no name set)
  useEffect(() => {
    if (!userName) setShowOnboarding(true)
  }, [])

  // Realtime nudges: regenerate whenever spending, goals or debts change
  const spendingKey = envelopes.map((e) => e.txns.reduce((a, t) => a + t.amt, 0)).join(',')
  const goalsKey = goals.map((g) => g.currentAmount).join(',')
  const debtsKey = debts.map((d) => d.remainingAmount).join(',')
  useEffect(() => {
    store.generateNudges()
  }, [spendingKey, goalsKey, debtsKey, recurringEntries.length])

  useEffect(() => {
    const h = new Date().getHours()
    setTod(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    const now = new Date()
    setCurrentMonth(`${months[now.getMonth()]} ${now.getFullYear()}`)
  }, [])

  // ── Derived numbers ──
  const totalBudget = envelopes.reduce((s, e) => s + e.budget, 0)
  const totalSpent = envelopes.reduce((s, e) => s + e.txns.reduce((a, t) => a + t.amt, 0), 0)
  const totalLeft = income - totalSpent
  const allocPct = pctOf(totalBudget, income)
  const spentPct = pctOf(totalSpent, totalBudget)
  const usedOfIncome = pctOf(totalSpent, income)
  const unread = nudges.filter((n) => !n.read)

  const lastSpent = history[0] ? history[0].snapshots.reduce((a, e) => a + e.spent, 0) : 0
  const vsLast = lastSpent > 0 ? Math.round(((totalSpent - lastSpent) / lastSpent) * 100) : null

  const over = totalBudget > 0 && totalSpent > totalBudget
  const watch = totalBudget > 0 && totalSpent / totalBudget > 0.8
  const statusLabel = over ? 'Over Budget' : watch ? 'Watch Spending' : 'On Track'
  const statusCls = over ? 'pill-over' : watch ? 'pill-warn' : 'pill-ok'
  const expenseTone = over ? 'over' : watch ? 'warn' : 'ok'

  const recent = useMemo(() => collectTransactions(envelopes).slice(0, 5), [envelopes])

  const insight = useMemo(() => {
    if (unread[0]) return unread[0].message
    if (totalSpent === 0) return 'Log your first expense and your insights will show up here.'
    const spentBy = envelopes
      .map((e) => ({ name: e.name, spent: e.txns.reduce((a, t) => a + t.amt, 0) }))
      .sort((a, b) => b.spent - a.spent)[0]
    const share = Math.round((spentBy.spent / totalSpent) * 100)
    return `${spentBy.name} is your biggest spend at ${share}% of everything you've spent this month.`
  }, [unread[0]?.message, totalSpent, spendingKey])

  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount).slice(0, 2)
  const activeDebts = debts.filter((d) => d.status === 'active').slice(0, 2)
  const upcomingRec = recurringEntries
    .filter((r) => {
      if (!r.active) return false
      const days = Math.ceil((new Date(r.nextDue).getTime() - Date.now()) / 86400000)
      return days <= 7 && days >= 0
    })
    .slice(0, 3)

  const greeting = userName ? `${tod}, ${userName}!` : `${tod}!`

  // ── Blocks reused on mobile + desktop ──
  const balanceCard = (
    <div className="card-hero rounded-[22px] p-5 relative overflow-hidden">
      <div
        className="absolute -top-16 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'var(--brand)' }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Left to spend
          </p>
          <span className={clsx('pill', statusCls)}>{statusLabel}</span>
        </div>

        <Money
          value={totalLeft}
          currency={currency}
          className="block font-serif text-[38px] leading-none font-bold text-white mt-2.5 tracking-tight"
        />
        <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {usedOfIncome}% of {fp(income)} income spent
        </p>

        {vsLast !== null && (
          <span
            className="inline-flex items-center gap-1.5 mt-3 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: vsLast > 0 ? 'rgba(239,68,68,0.14)' : 'rgba(64,255,225,0.12)',
              color: vsLast > 0 ? '#fca5a5' : '#40FFE1',
            }}
          >
            {vsLast > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {vsLast > 0 ? '+' : ''}
            {vsLast}% spending vs last month
          </span>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <MiniStat
            href="/settings"
            label="Income"
            value={income}
            currency={currency}
            Icon={Wallet}
            badge={`${allocPct}% planned`}
            tone="ok"
          />
          <MiniStat
            href="/transactions"
            label="Expenses"
            value={totalSpent}
            currency={currency}
            Icon={Receipt}
            badge={`${spentPct}% used`}
            tone={expenseTone}
          />
        </div>

        <div className="mt-5">
          <div
            className="flex justify-between text-[11px] font-semibold mb-1.5"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            <span>Allocated</span>
            <span>{allocPct}% of income</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, allocPct)}%`, background: 'var(--brand-grad)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const insightInner = (
    <>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#000d0b' }}
      >
        <Sparkles size={17} style={{ color: '#40FFE1' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: '#000d0b' }}>
          Smart Insight
        </p>
        <p
          className="text-xs leading-snug mt-0.5 line-clamp-2"
          style={{ color: 'rgba(0,13,11,0.75)' }}
        >
          {insight}
        </p>
      </div>
      {unread.length > 0 && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,13,11,0.14)', color: '#000d0b' }}
        >
          <ChevronRight size={16} />
        </div>
      )}
    </>
  )
  const insightCard =
    unread.length > 0 ? (
      <button
        onClick={() => setShowNudges(true)}
        className="w-full rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
        style={{ background: 'var(--brand-grad)', boxShadow: 'var(--shadow-brand)' }}
      >
        {insightInner}
      </button>
    ) : (
      <div
        className="w-full rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'var(--brand-grad)', boxShadow: 'var(--shadow-brand)' }}
      >
        {insightInner}
      </div>
    )

  const recentBlock = (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Recent Transactions
        </p>
        <Link href="/transactions" className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          View all
        </Link>
      </div>
      {recent.length === 0 ? (
        <div className="card p-6 text-center">
          <Receipt size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            No expenses yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Tap the + button to log your first one
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((t) => (
            <div key={t.id} className="card px-3 py-3 flex items-center gap-3">
              <div className="icon-tile" style={{ background: `${CAT_COLORS[t.cat]}1f` }}>
                <span>{CAT_ICONS[t.cat]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {t.name}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {t.envName} · {dayLabel(t.date)}
                </p>
              </div>
              <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                -{fp(t.amt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  const envelopesBlock = (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
          My Envelopes
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus size={12} /> New
        </button>
      </div>
      {envelopes.length === 0 ? (
        <div className="card p-8 text-center">
          <Wallet size={26} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            No envelopes yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Create one to start setting money aside
          </p>
        </div>
      ) : (
        envelopes.map((env) => (
          <EnvelopeCard
            key={env.id}
            env={env}
            fp={fp}
            expanded={expandedEnvelopeId === env.id}
            txnDesc={txnDesc}
            txnAmt={txnAmt}
            setTxnDesc={setTxnDesc}
            setTxnAmt={setTxnAmt}
            store={store}
          />
        ))
      )}
    </section>
  )

  return (
    <>
      {showOnboarding && <GettingStarted onDone={() => setShowOnboarding(false)} />}

      <div className="p-4 lg:p-0 space-y-5">
        <MobileHeader eyebrow={`${tod} 👋`} title={userName || 'Welcome'} />

        <div className="hidden lg:block">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
            {currentMonth}
          </p>
          <p
            className="font-serif text-2xl font-semibold mt-0.5"
            style={{ color: 'var(--text-primary)' }}
            suppressHydrationWarning
          >
            {greeting}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            {balanceCard}
            {insightCard}
            <div className="lg:hidden">{recentBlock}</div>
            {envelopesBlock}
          </div>

          <div className="hidden lg:block space-y-5">
            {recentBlock}

            <div className="card p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="section-title">Goals</p>
                <Link href="/goals" className="text-xs font-semibold" style={{ color: 'var(--brand-ink)' }}>
                  View all
                </Link>
              </div>
              {activeGoals.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active goals</p>
              ) : (
                activeGoals.map((g) => {
                  const pct = pctOf(g.currentAmount, g.targetAmount)
                  return (
                    <div key={g.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {g.name}
                        </span>
                        <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, pct)}%`, background: g.color }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="card p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="section-title">Debt</p>
                <Link href="/debt" className="text-xs font-semibold" style={{ color: 'var(--brand-ink)' }}>
                  View all
                </Link>
              </div>
              {activeDebts.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active debts</p>
              ) : (
                activeDebts.map((d) => {
                  const pct = pctOf(d.totalAmount - d.remainingAmount, d.totalAmount)
                  const col = d.type === 'owe' ? '#ef4444' : 'var(--brand-ink)'
                  return (
                    <div key={d.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {d.name}
                        </span>
                        <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: col }}>
                          {fp(d.remainingAmount)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, pct)}%`, background: col }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="card p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="section-title">Upcoming</p>
                <Link href="/settings" className="text-xs font-semibold" style={{ color: 'var(--brand-ink)' }}>
                  Manage
                </Link>
              </div>
              {upcomingRec.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nothing due this week</p>
              ) : (
                upcomingRec.map((r) => {
                  const days = Math.ceil((new Date(r.nextDue).getTime() - Date.now()) / 86400000)
                  return (
                    <div key={r.id} className="row-item">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: r.type === 'income' ? 'var(--brand-ink)' : '#ef4444' }}
                      />
                      <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                      </span>
                      <span
                        className="text-[11px] font-semibold flex-shrink-0"
                        style={{ color: days === 0 ? '#ef4444' : '#f59e0b' }}
                      >
                        {days === 0 ? 'Today' : `${days}d`}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showAdd && <AddEnvelopeModal onClose={() => setShowAdd(false)} />}

      {showNudges && (
        <Modal onClose={() => setShowNudges(false)}>
          <NudgeList onClose={() => setShowNudges(false)} />
        </Modal>
      )}
    </>
  )
}

/* ─────────────────────────────  Mini stat tile  ───────────────────────────── */

const BADGE_TONE = {
  ok: { bg: 'rgba(64,255,225,0.14)', fg: '#40FFE1' },
  warn: { bg: 'rgba(251,191,36,0.16)', fg: '#fbbf24' },
  over: { bg: 'rgba(239,68,68,0.16)', fg: '#fca5a5' },
} as const

function MiniStat({
  href, label, value, currency, Icon, badge, tone,
}: {
  href: string
  label: string
  value: number
  currency: string
  Icon: LucideIcon
  badge: string
  tone: keyof typeof BADGE_TONE
}) {
  const t = BADGE_TONE[tone]
  return (
    <Link href={href} className="card-hero-inner p-3.5 block active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <Icon size={15} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: t.bg, color: t.fg }}
        >
          {badge}
        </span>
      </div>
      <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </p>
      <div className="flex items-end justify-between gap-1 mt-0.5">
        <Money value={value} currency={currency} className="text-[17px] font-bold text-white leading-tight" />
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </span>
      </div>
    </Link>
  )
}

/* ─────────────────────────────  Envelope card  ───────────────────────────── */

function EnvelopeCard({ env, fp, expanded, txnDesc, txnAmt, setTxnDesc, setTxnAmt, store }: any) {
  const spent = env.txns.reduce((a: number, t: any) => a + t.amt, 0)
  const rem = env.budget - spent
  const pct = pctOf(spent, env.budget)
  const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'var(--brand-ink)'
  const remColor = rem < 0 ? '#ef4444' : rem < env.budget * 0.2 ? '#f59e0b' : 'var(--brand-ink)'

  const addTxn = () => {
    const desc = txnDesc[env.id]?.trim()
    const amount = parseFloat(txnAmt[env.id] ?? '')
    if (!desc || isNaN(amount) || amount <= 0) return
    store.addTransaction(env.id, {
      name: desc,
      amt: amount,
      date: new Date().toISOString().split('T')[0],
    })
    setTxnDesc((p: any) => ({ ...p, [env.id]: '' }))
    setTxnAmt((p: any) => ({ ...p, [env.id]: '' }))
  }

  return (
    <div
      className={clsx('card overflow-hidden transition-all', expanded && 'outline outline-1 outline-offset-0')}
      style={expanded ? { outlineColor: 'var(--brand-dim)' } : {}}
    >
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => store.setExpandedEnvelope(expanded ? null : env.id)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="icon-tile" style={{ background: `${CAT_COLORS[env.cat]}1f` }}>
              <span>{CAT_ICONS[env.cat]}</span>
            </div>
            <div>
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {env.name}
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {env.cat}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{fp(spent)}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>of {fp(env.budget)}</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-input)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, pct)}%`, background: barColor }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold" style={{ color: remColor }}>
            {rem < 0 ? `Over by ${fp(-rem)}` : `${fp(rem)} left`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
            {expanded ? (
              <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="border-t px-4 pt-3 pb-4"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card-alt)' }}
        >
          <div className="flex gap-2 mb-3">
            <input
              className="input flex-1 h-9 text-xs"
              placeholder="Description"
              value={txnDesc[env.id] ?? ''}
              onChange={(e) => setTxnDesc((p: any) => ({ ...p, [env.id]: e.target.value }))}
              onKeyDown={(e: any) => e.key === 'Enter' && addTxn()}
            />
            <input
              className="input flex-none w-24 h-9 text-xs"
              type="number"
              placeholder="Amount"
              inputMode="decimal"
              value={txnAmt[env.id] ?? ''}
              onChange={(e) => setTxnAmt((p: any) => ({ ...p, [env.id]: e.target.value }))}
            />
            <button className="btn-primary h-9 py-0 px-3 text-xs whitespace-nowrap" onClick={addTxn}>
              + Add
            </button>
          </div>

          {env.txns.length === 0 ? (
            <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
          ) : (
            env.txns.map((t: any) => (
              <div key={t.id} className="row-item">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: 'var(--bg-input)' }}
                >
                  {CAT_ICONS[env.cat]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {t.name}
                  </p>
                  {t.date && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.date}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    -{fp(t.amt)}
                  </span>
                  <button onClick={() => store.removeTransaction(env.id, t.id)} aria-label="Delete expense">
                    <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            onClick={() => store.removeEnvelope(env.id)}
            className="mt-3 text-xs font-semibold flex items-center gap-1"
            style={{ color: '#ef4444' }}
          >
            <Trash2 size={11} /> Delete envelope
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────  Add envelope  ───────────────────────────── */

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
      <h3 className="font-serif text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        New Envelope
      </h3>
      <div className="space-y-3">
        <div>
          <label className="label">Envelope name</label>
          <input className="input" placeholder="e.g. Groceries" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Budget amount</label>
          <input
            className="input"
            type="number"
            placeholder="5000"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button
          onClick={onClose}
          className="h-11 px-5 text-sm font-semibold rounded-xl border"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button onClick={submit} className="btn-primary flex-1 h-11 py-0">
          Add envelope
        </button>
      </div>
    </Modal>
  )
}