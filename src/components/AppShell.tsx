'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useKurotStore } from '@/store'
import {
  Wallet, BarChart2, Target, CreditCard,
  Clock, Settings, Bell, Menu, X, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/',          label: 'Budget',    Icon: Wallet,    desc: 'Envelopes & spending' },
  { href: '/breakdown', label: 'Charts',    Icon: BarChart2, desc: 'Spending breakdown' },
  { href: '/goals',     label: 'Goals',     Icon: Target,    desc: 'Savings goals' },
  { href: '/debt',      label: 'Debt',      Icon: CreditCard,desc: 'Debt & receivables' },
  { href: '/history',   label: 'History',   Icon: Clock,     desc: 'Monthly snapshots' },
  { href: '/settings',  label: 'Settings',  Icon: Settings,  desc: 'Profile & preferences' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const store     = useKurotStore()
  const unread    = store.nudges.filter(n => !n.read).length
  const [time,    setTime]    = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const fmt = () => {
      const n = new Date()
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`)
    }
    fmt()
    const t = setInterval(fmt, 30000)
    return () => clearInterval(t)
  }, [])

  const currentNav = NAV.find(n => n.href === pathname)

  return (
    <div className="flex min-h-dvh w-full bg-green-50">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-green-800 flex-shrink-0 fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 flex items-center gap-3 border-b border-white/10">
          <KurotCoinIcon size={36} />
          <div>
            <p className="font-serif text-2xl text-white leading-none tracking-tight">Kurot</p>
            <p className="text-white/40 text-[11px] mt-0.5 italic">set aside a little for every need</p>
          </div>
        </div>

        {/* User greeting */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Welcome back</p>
          <p className="text-white font-semibold text-sm truncate">
            {store.userName || 'Your account'}
          </p>
          <p className="text-white/40 text-xs mt-0.5 tabular-nums" suppressHydrationWarning>{time}</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, Icon, desc }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/80'
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-white' : 'text-white/50 group-hover:text-white/70'}
                />
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-semibold leading-tight', active ? 'text-white' : 'text-white/70')}>{label}</p>
                  <p className="text-[11px] text-white/35 leading-tight mt-0.5 truncate">{desc}</p>
                </div>
                {active && <ChevronRight size={14} className="text-white/40 flex-shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {/* Income summary at bottom */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Monthly Income</p>
          <p className="text-white font-bold text-lg leading-none">
            {store.currency} {store.income.toLocaleString()}
          </p>
          {unread > 0 && (
            <Link href="/settings" className="mt-2 flex items-center gap-2 bg-yellow-400/20 rounded-lg px-3 py-1.5">
              <Bell size={12} className="text-yellow-300 flex-shrink-0" />
              <span className="text-yellow-200 text-xs font-semibold">{unread} nudge{unread > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── DESKTOP MAIN CONTENT ── */}
      <div className="hidden lg:flex flex-col flex-1 ml-64 xl:ml-72 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-green-800/10 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="font-serif text-xl text-green-900 leading-tight">{currentNav?.label ?? 'Kurot'}</h1>
            <p className="text-xs text-green-700/50 mt-0.5">{currentNav?.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <Link href="/settings" className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5">
                <Bell size={13} className="text-yellow-600" />
                <span className="text-xs font-bold text-yellow-700">{unread}</span>
              </Link>
            )}
            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {store.userName ? store.userName[0].toUpperCase() : 'K'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 xl:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex lg:hidden flex-col w-full min-h-dvh">
        {/* Mobile status bar */}
        <div className="bg-green-800 px-5 pt-3.5 pb-2.5 flex justify-between items-center flex-shrink-0">
          <span className="text-white/70 text-xs font-semibold tabular-nums" suppressHydrationWarning>{time}</span>
          <div className="flex items-center gap-2">
            <KurotCoinIcon size={20} />
            <span className="font-serif text-[17px] text-white tracking-tight leading-none">Kurot</span>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <Link href="/settings">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-green-900" style={{ background: '#e8b420' }}>
                  {unread}
                </span>
              </Link>
            )}
            <span className="text-white/70 text-sm">⚡</span>
          </div>
        </div>

        {/* Mobile page content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 72 }}>
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-800/10 flex z-50"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 py-2 flex-1 text-[10px] font-bold uppercase tracking-wide transition-colors duration-150',
                  active ? 'text-green-800' : 'text-green-700/35'
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

function KurotCoinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" className="flex-shrink-0">
      <circle cx="256" cy="256" r="210" fill="#f4c842" opacity="0.92" />
      <text x="256" y="272" textAnchor="middle" fontFamily="Georgia,serif" fontSize="200" fontWeight="700" fill="#1a6127">₱</text>
    </svg>
  )
}
