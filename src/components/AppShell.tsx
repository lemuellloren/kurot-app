'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useKurotStore } from '@/store'
import { Wallet, BarChart2, Target, CreditCard, Clock, Settings } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/',          label: 'Budget',    Icon: Wallet },
  { href: '/breakdown', label: 'Charts',    Icon: BarChart2 },
  { href: '/goals',     label: 'Goals',     Icon: Target },
  { href: '/debt',      label: 'Debt',      Icon: CreditCard },
  { href: '/history',   label: 'History',   Icon: Clock },
  { href: '/settings',  label: 'Settings',  Icon: Settings },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const nudges = useKurotStore(s => s.nudges)
  const unread = nudges.filter(n => !n.read).length
  const [time, setTime] = useState('')

  useEffect(() => {
    const fmt = () => {
      const n = new Date()
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`)
    }
    fmt()
    const t = setInterval(fmt, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full max-w-[430px] min-h-dvh bg-green-50 flex flex-col relative">
      {/* Status bar */}
      <div className="bg-green-800 px-5 pt-3.5 pb-2.5 flex justify-between items-center flex-shrink-0">
        <span className="text-white/70 text-xs font-semibold tabular-nums">{time}</span>
        <div className="flex items-center gap-2">
          <KurotCoinIcon />
          <span className="font-serif text-[17px] text-white tracking-tight leading-none">Kurot</span>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <Link href="/settings">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-green-900"
                style={{ background: '#e8b420' }}
              >
                {unread}
              </span>
            </Link>
          )}
          <span className="text-white/70 text-sm">⚡</span>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 72 }}>
        {children}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-green-800/10 flex z-50"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
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
  )
}

function KurotCoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 512 512" aria-hidden="true">
      <circle cx="256" cy="256" r="210" fill="#f4c842" opacity="0.92" />
      <text
        x="256" y="272"
        textAnchor="middle"
        fontFamily="Georgia,serif"
        fontSize="200"
        fontWeight="700"
        fill="#1a5c38"
      >
        ₱
      </text>
    </svg>
  )
}
