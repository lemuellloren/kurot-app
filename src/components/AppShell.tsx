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
import Image from 'next/image';

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nudgeRef.current && !nudgeRef.current.contains(e.target as Node))
        setNudgeOpen(false);
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
    <div
      className='flex min-h-dvh w-full'
      style={{ background: 'var(--bg-body)' }}
    >
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className='hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 fixed left-0 top-0 bottom-0 z-40'
        style={{
          background: '#000d0b',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div
          className='px-6 pt-7 pb-5 flex items-center border-b'
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <Image src='/logo.svg' alt='Kurot' width={110} height={32} />
        </div>
        <div
          className='px-5 py-4 border-b'
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm'
              style={{ background: 'var(--brand)', color: 'var(--brand-text)' }}
            >
              {store.userName ? store.userName[0].toUpperCase() : 'K'}
            </div>
            <div className='min-w-0'>
              <p className='text-white font-semibold text-sm truncate leading-tight'>
                {store.userName || 'Your account'}
              </p>
              <p className='text-white/40 text-xs mt-0.5'>
                {store.currency} {store.income.toLocaleString()} / mo
              </p>
            </div>
          </div>
          <p
            className='text-white/30 text-[11px] tabular-nums mt-3'
            suppressHydrationWarning
          >
            {time}
          </p>
        </div>
        <nav
          className='flex-1 px-3 py-3 space-y-0.5 overflow-y-auto'
          style={{ background: 'transparent' }}
        >
          <p className='text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1'>
            Menu
          </p>
          {NAV.map(({ href, label, Icon, desc }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative',
                  active
                    ? 'text-white'
                    : 'text-white/45 hover:text-white/75 hover:bg-white/5',
                )}
                style={active ? { background: 'rgba(64,255,225,0.10)' } : {}}
              >
                {active && (
                  <span
                    className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full'
                    style={{ background: 'var(--brand)' }}
                  />
                )}
                <div
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  )}
                  style={active ? { background: 'rgba(64,255,225,0.12)' } : {}}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ color: active ? 'var(--brand)' : undefined }}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className={clsx(
                      'text-sm font-semibold leading-tight',
                      active ? 'text-white' : '',
                    )}
                  >
                    {label}
                  </p>
                  <p className='text-[10px] text-white/30 mt-0.5 truncate'>
                    {desc}
                  </p>
                </div>
                {active && (
                  <ChevronRight
                    size={13}
                    className='text-white/30 flex-shrink-0'
                  />
                )}
              </Link>
            );
          })}
        </nav>
        {unread.length > 0 && (
          <div className='px-3 pb-3'>
            <Link
              href='/settings'
              className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full'
              style={{
                background: 'rgba(64,255,225,0.08)',
                border: '1px solid rgba(64,255,225,0.12)',
              }}
            >
              <Bell size={14} style={{ color: 'var(--brand)' }} />
              <span
                className='text-xs font-semibold'
                style={{ color: 'var(--brand)' }}
              >
                {unread.length} nudge{unread.length > 1 ? 's' : ''}
              </span>
            </Link>
          </div>
        )}
        <div
          className='px-5 py-3 border-t'
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className='text-white/20 text-[10px]'>Kurot v1.0.0 · Offline</p>
        </div>
      </aside>

      {/* ── DESKTOP MAIN ── */}
      <div className='hidden lg:flex flex-col flex-1 ml-64 xl:ml-72 min-w-0'>
        <header
          className='sticky top-0 z-30 backdrop-blur-xl border-b px-8 py-4 flex justify-between items-center flex-shrink-0'
          style={{
            background: 'var(--bg-header)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div>
            <h1
              className='font-serif text-lg font-semibold leading-tight'
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
          <div className='flex items-center gap-2'>
            <div className='relative' ref={nudgeRef}>
              <button
                onClick={() => setNudgeOpen((v) => !v)}
                className='relative w-9 h-9 rounded-xl flex items-center justify-center transition-all'
                style={{
                  background: nudgeOpen ? 'var(--brand-dim)' : 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <Bell
                  size={16}
                  style={{
                    color:
                      unread.length > 0 ? 'var(--brand)' : 'var(--text-muted)',
                  }}
                />
                {unread.length > 0 && (
                  <span className='absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black badge'>
                    {unread.length > 9 ? '9+' : unread.length}
                  </span>
                )}
              </button>
              {nudgeOpen && (
                <div
                  className='absolute right-0 top-11 w-80 rounded-xl border overflow-hidden z-50'
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-strong)',
                    boxShadow: 'var(--shadow-card-lg)',
                  }}
                >
                  <div
                    className='flex justify-between items-center px-4 py-3 border-b'
                    style={{ borderColor: 'var(--border-default)' }}
                  >
                    <div className='flex items-center gap-2'>
                      <Bell size={13} style={{ color: 'var(--text-muted)' }} />
                      <p
                        className='text-sm font-bold'
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Smart Nudges
                      </p>
                      {unread.length > 0 && (
                        <span className='badge'>{unread.length} new</span>
                      )}
                    </div>
                    {nudges.length > 0 && (
                      <button
                        onClick={() => {
                          nudges.forEach((n) => store.markNudgeRead(n.id));
                          setNudgeOpen(false);
                        }}
                        className='flex items-center gap-1 text-xs font-semibold transition-all'
                        style={{ color: '#ef4444' }}
                      >
                        <CheckCheck size={11} /> Clear all
                      </button>
                    )}
                  </div>
                  <div className='max-h-72 overflow-y-auto'>
                    {nudges.length === 0 ? (
                      <div className='py-8 text-center'>
                        <Bell
                          size={22}
                          className='mx-auto mb-2'
                          style={{ color: 'var(--text-muted)' }}
                        />
                        <p
                          className='text-sm'
                          style={{ color: 'var(--text-muted)' }}
                        >
                          All caught up!
                        </p>
                        <p
                          className='text-xs mt-1'
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
                            'flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-all',
                            n.read && 'opacity-30',
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
                              className='flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all hover:bg-red-50'
                              title='Dismiss'
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    className='px-4 py-2.5 border-t'
                    style={{
                      borderColor: 'var(--border-default)',
                      background: 'var(--bg-card-alt)',
                    }}
                  >
                    <Link
                      href='/settings'
                      onClick={() => setNudgeOpen(false)}
                      className='text-xs font-semibold'
                      style={{ color: 'var(--brand)' }}
                    >
                      Manage in Settings →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div
              className='w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm'
              style={{ background: 'var(--brand)', color: 'var(--brand-text)' }}
            >
              {store.userName ? store.userName[0].toUpperCase() : 'K'}
            </div>
          </div>
        </header>
        <main
          className='flex-1 overflow-y-auto p-6 xl:p-8'
          style={{ background: 'var(--bg-page)' }}
        >
          <div className='max-w-5xl mx-auto'>{children}</div>
        </main>
      </div>

      {/* ── MOBILE ── */}
      <div className='flex lg:hidden flex-col w-full min-h-dvh'>
        <div
          className='px-4 pt-4 pb-3 flex justify-between items-center flex-shrink-0'
          style={{
            background: '#000d0b',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span
            className='text-white/40 text-xs font-semibold tabular-nums'
            suppressHydrationWarning
          >
            {time}
          </span>
          <Image src='/logo.svg' alt='Kurot' width={90} height={26} />
          <div className='flex items-center gap-2'>
            {unread.length > 0 && (
              <span className='badge'>{unread.length}</span>
            )}
            <span className='text-white/40 text-xs'>⚡</span>
          </div>
        </div>
        <div
          className='flex-1 overflow-y-auto overflow-x-hidden'
          style={{ paddingBottom: 68 }}
        >
          {children}
        </div>
        <nav
          className='fixed bottom-0 left-0 right-0 flex z-50'
          style={{
            background: '#000d0b',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          }}
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className='flex flex-col items-center gap-0.5 py-2 flex-1 text-[10px] font-bold uppercase tracking-wide transition-colors'
                style={{ color: active ? '#40FFE1' : 'rgba(255,255,255,0.30)' }}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.7} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
