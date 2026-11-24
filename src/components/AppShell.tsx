'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Wallet, BarChart2, Target, CreditCard, Clock, Settings,
  Receipt, Bell, Plus, ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { useKurotStore } from '@/store'
import NudgeList from '@/components/NudgeList'
import QuickAddExpense from '@/components/QuickAddExpense'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
  desc: string
}

// Mobile floating nav: six primary destinations
const NAV: NavItem[] = [
  { href: '/',          label: 'Budget',   Icon: Wallet,     desc: 'Envelopes & spending' },
  { href: '/breakdown', label: 'Charts',   Icon: BarChart2,  desc: 'Spending breakdown' },
  { href: '/goals',     label: 'Goals',    Icon: Target,     desc: 'Savings goals' },
  { href: '/debt',      label: 'Debt',     Icon: CreditCard, desc: 'Debt & receivables' },
  { href: '/history',   label: 'History',  Icon: Clock,      desc: 'Monthly snapshots' },
  { href: '/settings',  label: 'Settings', Icon: Settings,   desc: 'Profile & preferences' },
]

// Desktop sidebar also lists Transactions (mobile reaches it via "View all")
const TRANSACTIONS: NavItem = {
  href: '/transactions',
  label: 'Transactions',
  Icon: Receipt,
  desc: 'All your expenses',
}
const DESKTOP_NAV: NavItem[] = [NAV[0], TRANSACTIONS, ...NAV.slice(1)]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const store = useKurotStore()
  const unread = store.nudges.filter((n) => !n.read)

  const [time, setTime] = useState('')
  const [nudgeOpen, setNudgeOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const nudgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fmt = () => {
      const n = new Date()
      setTime(
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`,
      )
    }
    fmt()
    const t = setInterval(fmt, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nudgeRef.current && !nudgeRef.current.contains(e.target as Node)) setNudgeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === ''
    return pathname === href || pathname === href + '/'
  }
  const currentNav = DESKTOP_NAV.find((n) => isActive(n.href))

  return (
    <div className="flex min-h-dvh w-full" style={{ background: 'var(--bg-body)' }}>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 fixed left-0 top-0 bottom-0 z-40"
        style={{ background: '#000d0b', borderRight: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div
          className="px-6 pt-7 pb-5 flex items-center border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <Image src="/logo.svg" alt="Kurot" width={110} height={32} />
        </div>

        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
              style={{ background: 'var(--brand-grad)', color: '#000d0b' }}
            >
              {store.userName ? store.userName[0].toUpperCase() : 'K'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate leading-tight">
                {store.userName || 'Your account'}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                {store.currency} {store.income.toLocaleString()} / mo
              </p>
            </div>
          </div>
          <p className="text-white/30 text-[11px] tabular-nums mt-3" suppressHydrationWarning>
            {time}
          </p>
        </div>

        <nav
          className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto"
          style={{ background: 'transparent' }}
        >
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1">
            Menu
          </p>
          {DESKTOP_NAV.map(({ href, label, Icon, desc }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative',
                  active ? 'text-white' : 'text-white/45 hover:text-white/75 hover:bg-white/5',
                )}
                style={active ? { background: 'rgba(64,255,225,0.10)' } : {}}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: '#40FFE1' }}
                  />
                )}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={active ? { background: 'rgba(64,255,225,0.12)' } : {}}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ color: active ? '#40FFE1' : undefined }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-semibold leading-tight', active && 'text-white')}>
                    {label}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5 truncate">{desc}</p>
                </div>
                {active && <ChevronRight size={13} className="text-white/30 flex-shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {unread.length > 0 && (
          <div className="px-3 pb-3">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full"
              style={{
                background: 'rgba(64,255,225,0.08)',
                border: '1px solid rgba(64,255,225,0.12)',
              }}
            >
              <Bell size={14} style={{ color: '#40FFE1' }} />
              <span className="text-xs font-semibold" style={{ color: '#40FFE1' }}>
                {unread.length} nudge{unread.length > 1 ? 's' : ''}
              </span>
            </Link>
          </div>
        )}

        <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-white/20 text-[10px]">Kurot v1.0.0 · Offline</p>
        </div>
      </aside>

      {/* ── DESKTOP MAIN ── */}
      <div className="hidden lg:flex flex-col flex-1 ml-64 xl:ml-72 min-w-0">
        <header
          className="sticky top-0 z-30 backdrop-blur-xl border-b px-8 py-4 flex justify-between items-center flex-shrink-0"
          style={{ background: 'var(--bg-header)', borderColor: 'var(--border-default)' }}
        >
          <div>
            <h1
              className="font-serif text-lg font-semibold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentNav?.label ?? 'Kurot'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {currentNav?.desc}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setQuickOpen(true)}
              className="btn-primary h-10 py-0 px-4 text-xs flex items-center gap-1.5"
            >
              <Plus size={14} strokeWidth={3} /> Add expense
            </button>

            <div className="relative" ref={nudgeRef}>
              <button
                onClick={() => setNudgeOpen((v) => !v)}
                className="icon-btn"
                aria-label="Nudges"
                style={nudgeOpen ? { background: 'var(--brand-dim)' } : {}}
              >
                <Bell
                  size={17}
                  style={{ color: unread.length > 0 ? 'var(--brand-ink)' : undefined }}
                />
                {unread.length > 0 && (
                  <span className="badge absolute -top-1 -right-1">
                    {unread.length > 9 ? '9+' : unread.length}
                  </span>
                )}
              </button>

              {nudgeOpen && (
                <div
                  className="absolute right-0 top-12 w-96 rounded-2xl border z-50 p-4"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-strong)',
                    boxShadow: 'var(--shadow-card-lg)',
                  }}
                >
                  <NudgeList onClose={() => setNudgeOpen(false)} />
                </div>
              )}
            </div>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: 'var(--brand-grad)', color: '#000d0b' }}
            >
              {store.userName ? store.userName[0].toUpperCase() : 'K'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ background: 'var(--bg-page)' }}>
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex lg:hidden flex-col w-full min-h-dvh">
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 112 }}
        >
          {children}
        </div>

        {/* Floating pill nav + quick-add button */}
        <div
          className="fixed inset-x-0 bottom-0 z-50 px-3 pointer-events-none"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-2.5 max-w-md mx-auto pointer-events-auto">
            <nav
              className="flex-1 flex items-center justify-between h-[60px] px-1.5 rounded-[22px]"
              style={{
                background: '#000d0b',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.38)',
              }}
            >
              {NAV.map(({ href, label, Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className="relative flex-1 h-12 flex items-center justify-center"
                  >
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: active ? 'rgba(64,255,225,0.12)' : 'transparent',
                        color: active ? '#40FFE1' : 'rgba(255,255,255,0.42)',
                      }}
                    >
                      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                    </span>
                    {active && (
                      <span
                        className="absolute bottom-0.5 w-1 h-1 rounded-full"
                        style={{ background: '#40FFE1' }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={() => setQuickOpen(true)}
              aria-label="Add expense"
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              style={{
                background: 'var(--brand-grad)',
                color: '#000d0b',
                boxShadow: '0 10px 26px rgba(64,255,225,0.30)',
              }}
            >
              <Plus size={26} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>

      {quickOpen && <QuickAddExpense onClose={() => setQuickOpen(false)} />}
    </div>
  )
}