'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKurotStore } from '@/store';
import {
  Wallet,
  BarChart2,
  Target,
  CreditCard,
  Clock,
  Settings,
  Bell,
  ChevronRight,
  X,
  CheckCheck,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/', label: 'Budget', Icon: Wallet, desc: 'Envelopes & spending' },
  {
    href: '/breakdown',
    label: 'Charts',
    Icon: BarChart2,
    desc: 'Spending breakdown',
  },
  { href: '/goals', label: 'Goals', Icon: Target, desc: 'Savings goals' },
  {
    href: '/debt',
    label: 'Debt',
    Icon: CreditCard,
    desc: 'Debt & receivables',
  },
  {
    href: '/history',
    label: 'History',
    Icon: Clock,
    desc: 'Monthly snapshots',
  },
  {
    href: '/settings',
    label: 'Settings',
    Icon: Settings,
    desc: 'Profile & preferences',
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const store = useKurotStore();
  const nudges = store.nudges;
  const unread = nudges.filter((n) => !n.read);

  const [time, setTime] = useState('');
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const nudgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fmt = () => {
      const n = new Date();
      setTime(
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`,
      );
    };
    fmt();
    const t = setInterval(fmt, 30000);
    return () => clearInterval(t);
  }, []);

  // Close nudge dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nudgeRef.current && !nudgeRef.current.contains(e.target as Node)) {
        setNudgeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname === href || pathname === href + '/';
  };

  const currentNav = NAV.find((n) => isActive(n.href));

  return (
    <div className='flex min-h-dvh w-full bg-green-50'>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className='hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 fixed left-0 top-0 bottom-0 z-40 transition-colors duration-200'
        style={{ background: '#000d0b' }}
      >
        {/* Logo */}
        <div className='px-6 pt-7 pb-5 flex items-center gap-3 border-b border-white/10'>
          <KurotCoinIcon size={36} />
          <div>
            <p className='font-serif text-2xl text-white leading-none tracking-tight'>
              Kurot
            </p>
            <p className='text-white/40 text-[11px] mt-0.5 italic'>
              set aside a little for every need
            </p>
          </div>
        </div>

        {/* User greeting */}
        <div className='px-6 py-4 border-b border-white/10'>
          <p className='text-white/40 text-xs uppercase tracking-widest mb-0.5'>
            Welcome back
          </p>
          <p className='text-white font-semibold text-sm truncate'>
            {store.userName || 'Your account'}
          </p>
          <p
            className='text-white/40 text-xs mt-0.5 tabular-nums'
            suppressHydrationWarning
          >
            {time}
          </p>
        </div>

        {/* Nav items */}
        <nav
          className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto'
          style={{ background: 'transparent' }}
        >
          {NAV.map(({ href, label, Icon, desc }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/80',
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={
                    active
                      ? 'text-white'
                      : 'text-white/50 group-hover:text-white/70'
                  }
                />
                <div className='flex-1 min-w-0'>
                  <p
                    className={clsx(
                      'text-sm font-semibold leading-tight',
                      active ? 'text-white' : 'text-white/70',
                    )}
                  >
                    {label}
                  </p>
                  <p className='text-[11px] text-white/35 leading-tight mt-0.5 truncate'>
                    {desc}
                  </p>
                </div>
                {active && (
                  <ChevronRight
                    size={14}
                    className='text-white/40 flex-shrink-0'
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Income summary */}
        <div className='px-5 py-4 border-t border-white/10'>
          <p className='text-white/40 text-[10px] uppercase tracking-widest mb-1'>
            Monthly Income
          </p>
          <p className='text-white font-bold text-lg leading-none'>
            {store.currency} {store.income.toLocaleString()}
          </p>
        </div>
      </aside>

      {/* ── DESKTOP MAIN ── */}
      <div className='hidden lg:flex flex-col flex-1 ml-64 xl:ml-72 min-w-0'>
        {/* Top bar */}
        <header
          className='sticky top-0 z-30 backdrop-blur-md border-b px-8 py-3.5 flex justify-between items-center flex-shrink-0 transition-colors duration-200'
          style={{
            background: 'var(--bg-header)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div>
            <h1
              className='font-serif text-xl leading-tight'
              style={{ color: 'var(--text-primary)' }}
            >
              {currentNav?.label ?? 'Kurot'}
            </h1>
            <p
              className='text-xs mt-0.5'
              style={{ color: 'var(--text-muted)' }}
            >
              {currentNav?.desc}
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* ── Desktop nudge bell + dropdown ── */}
            <div className='relative' ref={nudgeRef}>
              <button
                onClick={() => setNudgeOpen((v) => !v)}
                className={clsx(
                  'relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                  nudgeOpen ? 'bg-green-100' : 'hover:bg-green-50',
                )}
                style={nudgeOpen ? { background: 'var(--brand-lighter)' } : {}}
              >
                <Bell
                  size={18}
                  style={{
                    color:
                      unread.length > 0 ? 'var(--brand)' : 'var(--text-muted)',
                  }}
                />
                {unread.length > 0 && (
                  <span
                    className='absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold'
                    style={{ background: '#40FFE1', color: '#415353' }}
                  >
                    {unread.length > 9 ? '9+' : unread.length}
                  </span>
                )}
              </button>

              {/* Nudge dropdown panel */}
              {nudgeOpen && (
                <div
                  className='absolute right-0 top-11 w-80 rounded-2xl border overflow-hidden z-50'
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-default)',
                    boxShadow: 'var(--shadow-card-lg)',
                  }}
                >
                  {/* Panel header */}
                  <div
                    className='flex justify-between items-center px-4 py-3 border-b'
                    style={{ borderColor: 'var(--border-default)' }}
                  >
                    <div className='flex items-center gap-2'>
                      <Bell
                        size={14}
                        style={{ color: 'var(--text-secondary)' }}
                      />
                      <p
                        className='text-sm font-bold'
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Smart Nudges
                      </p>
                      {unread.length > 0 && (
                        <span
                          className='text-[10px] font-bold px-1.5 py-0.5 rounded-full'
                          style={{
                            background: 'var(--brand-lighter)',
                            color: 'var(--brand)',
                          }}
                        >
                          {unread.length} new
                        </span>
                      )}
                    </div>
                    {unread.length > 0 && (
                      <button
                        onClick={() => {
                          store.clearReadNudges();
                          setNudgeOpen(false);
                        }}
                        className='flex items-center gap-1 text-xs font-semibold transition-colors'
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = 'var(--brand)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = 'var(--text-muted)')
                        }
                      >
                        <CheckCheck size={12} />
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Nudge list */}
                  <div className='max-h-80 overflow-y-auto'>
                    {nudges.length === 0 ? (
                      <div className='py-8 text-center'>
                        <Bell
                          size={24}
                          className='mx-auto mb-2'
                          style={{ color: 'var(--text-muted)' }}
                        />
                        <p
                          className='text-sm'
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          All caught up!
                        </p>
                        <p
                          className='text-xs mt-0.5'
                          style={{ color: 'var(--text-muted)' }}
                        >
                          No nudges right now
                        </p>
                      </div>
                    ) : (
                      nudges.map((n) => (
                        <div
                          key={n.id}
                          className={clsx(
                            'flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors',
                            n.read ? 'opacity-40' : '',
                          )}
                          style={{ borderColor: 'var(--border-default)' }}
                        >
                          <span className='text-sm flex-shrink-0 mt-0.5'>
                            {n.severity === 'danger'
                              ? '🔴'
                              : n.severity === 'warning'
                                ? '🟡'
                                : '🔵'}
                          </span>
                          <div className='flex-1 min-w-0'>
                            <p
                              className='text-xs leading-relaxed'
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {n.message}
                            </p>
                            <p
                              className='text-[10px] mt-1'
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {n.date}
                            </p>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => store.markNudgeRead(n.id)}
                              className='flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors'
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className='px-4 py-2.5 border-t'
                    style={{
                      borderColor: 'var(--border-default)',
                      background: 'var(--bg-input)',
                    }}
                  >
                    <Link
                      href='/settings'
                      onClick={() => setNudgeOpen(false)}
                      className='text-xs font-semibold transition-colors'
                      style={{ color: 'var(--brand)' }}
                    >
                      Manage nudges in Settings →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div
              className='w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0'
              style={{ background: 'var(--brand)' }}
            >
              <span
                className='text-xs font-bold'
                style={{ color: 'var(--bg-sidebar)' }}
              >
                {store.userName ? store.userName[0].toUpperCase() : 'K'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className='flex-1 overflow-y-auto p-6 xl:p-8 transition-colors duration-200'
          style={{ background: 'var(--bg-page)' }}
        >
          <div className='max-w-5xl mx-auto'>{children}</div>
        </main>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className='flex lg:hidden flex-col w-full min-h-dvh'>
        {/* Mobile status bar */}
        <div
          className='px-5 pt-3.5 pb-2.5 flex justify-between items-center flex-shrink-0 transition-colors duration-200'
          style={{ background: '#000d0b' }}
        >
          <span
            className='text-white/70 text-xs font-semibold tabular-nums'
            suppressHydrationWarning
          >
            {time}
          </span>
          <div className='flex items-center gap-2'>
            <KurotCoinIcon size={20} />
            <span className='font-serif text-[17px] text-white tracking-tight leading-none'>
              Kurot
            </span>
          </div>
          <div className='flex items-center gap-2'>
            {unread.length > 0 && (
              <span
                className='w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold'
                style={{ background: '#40FFE1', color: '#415353' }}
              >
                {unread.length}
              </span>
            )}
            <span className='text-white/70 text-sm'>⚡</span>
          </div>
        </div>

        {/* Mobile page content */}
        <div
          className='flex-1 overflow-y-auto overflow-x-hidden'
          style={{ paddingBottom: 72 }}
        >
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav
          className='fixed bottom-0 left-0 right-0 flex z-50 border-t'
          style={{
            background: '#000d0b',
            borderColor: 'rgba(64,255,225,0.10)',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          }}
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 py-2 flex-1 text-[10px] font-bold uppercase tracking-wide transition-colors duration-150',
                )}
                style={{ color: isActive(href) ? '#40FFE1' : '#415353' }}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function KurotCoinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 512 512'
      aria-hidden='true'
      className='flex-shrink-0'
    >
      <circle cx='256' cy='256' r='210' fill='#40FFE1' opacity='0.92' />
      <text
        x='256'
        y='272'
        textAnchor='middle'
        fontFamily='Poppins,sans-serif'
        fontSize='200'
        fontWeight='700'
        fill='#011412'
      >
        ₱
      </text>
    </svg>
  );
}
