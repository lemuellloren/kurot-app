'use client';
import { useState, useEffect } from 'react';
import { useKurotStore, CAT_COLORS, CAT_ICONS, CATEGORIES } from '@/store';
import { formatCurrency, pctOf } from '@/lib/utils';
import Modal from '@/components/Modal';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Bell,
  X,
  TrendingDown,
  RefreshCw,
  Target,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const store = useKurotStore();
  const {
    userName,
    income,
    currency,
    envelopes,
    expandedEnvelopeId,
    nudges,
    goals,
    debts,
    recurringEntries,
  } = store;
  const [showAdd, setShowAdd] = useState(false);
  const [showNudges, setShowNudges] = useState(false);
  const [txnDesc, setTxnDesc] = useState<Record<string, string>>({});
  const [txnAmt, setTxnAmt] = useState<Record<string, string>>({});
  const [greeting, setGreeting] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const fp = (n: number) => formatCurrency(n, currency);

  // Realtime nudges — regenerate whenever spending, goals or debts change
  const spendingKey = envelopes
    .map((e) => e.txns.reduce((a, t) => a + t.amt, 0))
    .join(',');
  const goalsKey = goals.map((g) => g.currentAmount).join(',');
  const debtsKey = debts.map((d) => d.remainingAmount).join(',');
  useEffect(() => {
    store.generateNudges();
  }, [spendingKey, goalsKey, debtsKey, recurringEntries.length]);
  useEffect(() => {
    const h = new Date().getHours();
    const tod =
      h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    setGreeting(userName ? `${tod}, ${userName}!` : `${tod}!`);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const now = new Date();
    setCurrentMonth(`${months[now.getMonth()]} ${now.getFullYear()}`);
  }, [userName]);

  const totalBudget = envelopes.reduce((s, e) => s + e.budget, 0);
  const totalSpent = envelopes.reduce(
    (s, e) => s + e.txns.reduce((a, t) => a + t.amt, 0),
    0,
  );
  const totalLeft = income - totalSpent;
  const allocPct = pctOf(totalBudget, income);
  const savingsPct = Math.max(0, pctOf(totalLeft, income));
  const unread = nudges.filter((n) => !n.read);

  const statusLabel =
    totalSpent > totalBudget
      ? 'Over Budget'
      : totalSpent / (totalBudget || 1) > 0.8
        ? 'Watch Spending'
        : 'On Track';
  const statusCls =
    totalSpent > totalBudget
      ? 'pill-over'
      : totalSpent / (totalBudget || 1) > 0.8
        ? 'pill-warn'
        : 'pill-ok';

  const activeGoals = goals
    .filter((g) => g.currentAmount < g.targetAmount)
    .slice(0, 2);
  const activeDebts = debts.filter((d) => d.status === 'active').slice(0, 2);
  const upcomingRec = recurringEntries
    .filter((r) => {
      if (!r.active) return false;
      const days = Math.ceil(
        (new Date(r.nextDue).getTime() - Date.now()) / 86400000,
      );
      return days <= 7 && days >= 0;
    })
    .slice(0, 3);

  return (
    <>
      <div className='p-4 space-y-4 lg:p-0 lg:space-y-5'>
        {/* ── MOBILE ── */}
        <div className='lg:hidden space-y-3'>
          <div className='flex justify-between items-start'>
            <div>
              <p
                className='text-xs font-semibold'
                style={{ color: 'var(--text-muted)' }}
                suppressHydrationWarning
              >
                {currentMonth}
              </p>
              <p
                className='text-lg font-bold mt-0.5'
                style={{ color: 'var(--text-primary)' }}
                suppressHydrationWarning
              >
                {greeting}
              </p>
            </div>
            {unread.length > 0 && (
              <button
                onClick={() => setShowNudges(true)}
                className='relative w-9 h-9 rounded-xl flex items-center justify-center'
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <Bell size={16} style={{ color: 'var(--brand)' }} />
                <span className='absolute -top-1 -right-1 badge'>
                  {unread.length}
                </span>
              </button>
            )}
          </div>

          {/* Mobile hero balance card */}
          <div
            className='rounded-2xl p-5 relative overflow-hidden'
            style={{
              background:
                'linear-gradient(135deg, #000d0b 0%, #001a16 50%, #002a22 100%)',
              border: '1px solid rgba(64,255,225,0.12)',
            }}
          >
            <div
              className='absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none'
              style={{ background: 'var(--brand)' }}
            />
            <div className='relative z-10'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <p className='text-xs font-medium text-white/50 mb-1'>
                    Monthly Income
                  </p>
                  <p className='font-serif text-3xl font-bold text-white leading-none'>
                    {fp(income)}
                  </p>
                </div>
                <span className={clsx('pill', statusCls)}>{statusLabel}</span>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {[
                  {
                    label: 'Budgeted',
                    val: fp(totalBudget),
                    col: 'rgba(255,255,255,0.75)',
                  },
                  { label: 'Spent', val: fp(totalSpent), col: '#fca5a5' },
                  {
                    label: 'Left',
                    val: fp(Math.max(0, totalLeft)),
                    col: '#40FFE1',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className='rounded-xl p-2.5'
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <p className='text-[10px] text-white/40 font-semibold uppercase tracking-wide'>
                      {s.label}
                    </p>
                    <p
                      className='text-sm font-bold mt-0.5'
                      style={{ color: s.col }}
                    >
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation bar */}
          <div className='card px-4 py-3'>
            <div
              className='flex justify-between text-xs font-semibold mb-2'
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Allocation</span>
              <span>{allocPct}% of income</span>
            </div>
            <div
              className='h-1.5 rounded-full overflow-hidden'
              style={{ background: 'var(--bg-input)' }}
            >
              <div
                className='h-full rounded-full transition-all duration-700'
                style={{ width: `${allocPct}%`, background: 'var(--brand)' }}
              />
            </div>
          </div>
        </div>

        {/* ── DESKTOP ── */}
        <div className='hidden lg:block space-y-5'>
          <div className='flex justify-between items-center'>
            <div>
              <p
                className='text-xs font-semibold'
                style={{ color: 'var(--text-muted)' }}
                suppressHydrationWarning
              >
                {currentMonth}
              </p>
              <p
                className='font-serif text-2xl font-semibold mt-0.5'
                style={{ color: 'var(--text-primary)' }}
                suppressHydrationWarning
              >
                {greeting}
              </p>
            </div>
            {unread.length > 0 && (
              <button
                onClick={() => setShowNudges(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold'
                style={{
                  background: 'var(--brand-dim)',
                  color: 'var(--brand)',
                  border: '1px solid rgba(64,255,225,0.15)',
                }}
              >
                <Bell size={13} /> {unread.length} nudge
                {unread.length > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* 4 stat cards */}
          <div className='grid grid-cols-4 gap-4'>
            {[
              {
                label: 'Monthly Income',
                val: fp(income),
                sub: 'Total budget',
                Icon: Wallet,
                accent: true,
              },
              {
                label: 'Budgeted',
                val: fp(totalBudget),
                sub: `${allocPct}% allocated`,
                Icon: ArrowUpRight,
                accent: false,
              },
              {
                label: 'Spent',
                val: fp(totalSpent),
                sub: `${pctOf(totalSpent, totalBudget)}% of budget`,
                Icon: TrendingDown,
                accent: false,
                danger: true,
              },
              {
                label: 'Remaining',
                val: fp(Math.max(0, totalLeft)),
                sub: `${savingsPct}% savings rate`,
                Icon: Target,
                accent: false,
                success: true,
              },
            ].map((s, i) => (
              <div
                key={i}
                className='relative overflow-hidden rounded-xl'
                style={s.accent ? {} : undefined}
              >
                {s.accent ? (
                  <div
                    className='absolute inset-0 rounded-xl'
                    style={{
                      background:
                        'linear-gradient(135deg, #000d0b, #001a16, #002a22)',
                      border: '1px solid rgba(64,255,225,0.12)',
                    }}
                  />
                ) : null}
                <div className={clsx('relative z-10 p-4', !s.accent && 'card')}>
                  <div className='flex justify-between items-start mb-3'>
                    <p
                      className='text-xs font-semibold'
                      style={{
                        color: s.accent
                          ? 'rgba(255,255,255,0.5)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {s.label}
                    </p>
                    <div
                      className='w-7 h-7 rounded-lg flex items-center justify-center'
                      style={{
                        background: s.accent
                          ? 'rgba(64,255,225,0.12)'
                          : 'var(--bg-card-alt)',
                      }}
                    >
                      <s.Icon
                        size={13}
                        style={{
                          color: s.accent
                            ? 'var(--brand)'
                            : 'var(--text-muted)',
                        }}
                      />
                    </div>
                  </div>
                  <p
                    className='font-serif text-2xl font-bold leading-none'
                    style={{
                      color: s.accent
                        ? '#fff'
                        : s.danger
                          ? '#ef4444'
                          : s.success
                            ? 'var(--brand)'
                            : 'var(--text-primary)',
                    }}
                  >
                    {s.val}
                  </p>
                  <p
                    className='text-xs mt-1.5'
                    style={{
                      color: s.accent
                        ? 'rgba(255,255,255,0.35)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {s.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 2+1 grid */}
          <div className='grid grid-cols-3 gap-5'>
            <div className='col-span-2 space-y-3'>
              <div className='flex justify-between items-center'>
                <p className='section-title'>My Envelopes</p>
                <button
                  onClick={() => setShowAdd(true)}
                  className='btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5'
                >
                  <Plus size={12} /> New Envelope
                </button>
              </div>
              <div className='card px-4 py-3'>
                <div
                  className='flex justify-between text-xs font-semibold mb-2'
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>Income allocation</span>
                  <span>{allocPct}%</span>
                </div>
                <div
                  className='h-1.5 rounded-full overflow-hidden'
                  style={{ background: 'var(--bg-input)' }}
                >
                  <div
                    className='h-full rounded-full transition-all duration-700'
                    style={{
                      width: `${allocPct}%`,
                      background: 'var(--brand)',
                    }}
                  />
                </div>
              </div>
              {envelopes.map((env) => (
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
            <div className='space-y-4'>
              <div className='card p-4'>
                <div className='flex justify-between items-center mb-3'>
                  <p className='section-title'>Goals</p>
                  <a
                    href='/goals'
                    className='text-xs font-semibold'
                    style={{ color: 'var(--brand)' }}
                  >
                    View all
                  </a>
                </div>
                {activeGoals.length === 0 ? (
                  <p className='text-xs' style={{ color: 'var(--text-muted)' }}>
                    No active goals
                  </p>
                ) : (
                  activeGoals.map((g) => {
                    const pct = pctOf(g.currentAmount, g.targetAmount);
                    return (
                      <div key={g.id} className='mb-3 last:mb-0'>
                        <div className='flex justify-between mb-1.5'>
                          <span
                            className='text-xs font-semibold truncate'
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {g.name}
                          </span>
                          <span
                            className='text-xs ml-2 flex-shrink-0'
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div
                          className='h-1.5 rounded-full overflow-hidden'
                          style={{ background: 'var(--bg-input)' }}
                        >
                          <div
                            className='h-full rounded-full'
                            style={{ width: `${pct}%`, background: g.color }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className='card p-4'>
                <div className='flex justify-between items-center mb-3'>
                  <p className='section-title'>Debt</p>
                  <a
                    href='/debt'
                    className='text-xs font-semibold'
                    style={{ color: 'var(--brand)' }}
                  >
                    View all
                  </a>
                </div>
                {activeDebts.length === 0 ? (
                  <p className='text-xs' style={{ color: 'var(--text-muted)' }}>
                    No active debts
                  </p>
                ) : (
                  activeDebts.map((d) => {
                    const pct = pctOf(
                      d.totalAmount - d.remainingAmount,
                      d.totalAmount,
                    );
                    return (
                      <div key={d.id} className='mb-3 last:mb-0'>
                        <div className='flex justify-between mb-1.5'>
                          <span
                            className='text-xs font-semibold truncate'
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {d.name}
                          </span>
                          <span
                            className='text-xs font-semibold ml-2 flex-shrink-0'
                            style={{
                              color:
                                d.type === 'owe' ? '#ef4444' : 'var(--brand)',
                            }}
                          >
                            {fp(d.remainingAmount)}
                          </span>
                        </div>
                        <div
                          className='h-1.5 rounded-full overflow-hidden'
                          style={{ background: 'var(--bg-input)' }}
                        >
                          <div
                            className='h-full rounded-full'
                            style={{
                              width: `${pct}%`,
                              background:
                                d.type === 'owe' ? '#ef4444' : 'var(--brand)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className='card p-4'>
                <div className='flex justify-between items-center mb-3'>
                  <p className='section-title'>Upcoming</p>
                  <a
                    href='/settings'
                    className='text-xs font-semibold'
                    style={{ color: 'var(--brand)' }}
                  >
                    Manage
                  </a>
                </div>
                {upcomingRec.length === 0 ? (
                  <p className='text-xs' style={{ color: 'var(--text-muted)' }}>
                    Nothing due this week
                  </p>
                ) : (
                  upcomingRec.map((r) => {
                    const days = Math.ceil(
                      (new Date(r.nextDue).getTime() - Date.now()) / 86400000,
                    );
                    return (
                      <div key={r.id} className='row-item'>
                        <div
                          className='w-2 h-2 rounded-full flex-shrink-0'
                          style={{
                            background:
                              r.type === 'income' ? 'var(--brand)' : '#ef4444',
                          }}
                        />
                        <span
                          className='text-xs flex-1 truncate'
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {r.name}
                        </span>
                        <span
                          className='text-[11px] font-semibold flex-shrink-0'
                          style={{ color: days === 0 ? '#ef4444' : '#f59e0b' }}
                        >
                          {days === 0 ? 'Today' : `${days}d`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile envelopes */}
        <div className='lg:hidden space-y-2'>
          <div className='flex justify-between items-center'>
            <p className='section-title'>My Envelopes</p>
            <button
              onClick={() => setShowAdd(true)}
              className='btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5'
            >
              <Plus size={12} /> New
            </button>
          </div>
          {envelopes.map((env) => (
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

      {showAdd && <AddEnvelopeModal onClose={() => setShowAdd(false)} />}

      {showNudges && (
        <Modal onClose={() => setShowNudges(false)}>
          {/* Header */}
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center gap-2'>
              <h3
                className='font-serif text-lg font-semibold'
                style={{ color: 'var(--text-primary)' }}
              >
                Smart Nudges
              </h3>
              {nudges.length > 0 && (
                <span className='badge'>{nudges.length}</span>
              )}
            </div>
            {nudges.length > 0 && (
              <button
                onClick={() => {
                  store.clearReadNudges?.();
                  nudges.forEach((n) => store.markNudgeRead(n.id));
                }}
                className='text-xs font-semibold px-3 py-1.5 rounded-lg transition-all'
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Empty state */}
          {nudges.length === 0 ? (
            <div className='py-8 text-center'>
              <Bell
                size={32}
                className='mx-auto mb-3'
                style={{ color: 'var(--text-muted)' }}
              />
              <p
                className='text-sm font-semibold'
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
            <div className='space-y-2'>
              {nudges.map((n) => (
                <div
                  key={n.id}
                  className={clsx(
                    'flex items-start gap-3 p-3 rounded-xl border transition-all',
                    n.read && 'opacity-40',
                  )}
                  style={{
                    background:
                      n.severity === 'danger'
                        ? 'rgba(239,68,68,0.06)'
                        : n.severity === 'warning'
                          ? 'rgba(251,191,36,0.06)'
                          : 'rgba(64,255,225,0.05)',
                    borderColor:
                      n.severity === 'danger'
                        ? 'rgba(239,68,68,0.15)'
                        : n.severity === 'warning'
                          ? 'rgba(251,191,36,0.15)'
                          : 'rgba(64,255,225,0.10)',
                  }}
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
                  <button
                    onClick={() => store.markNudgeRead(n.id)}
                    className='flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-50'
                    title='Dismiss'
                  >
                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className='mt-4 pt-3 border-t'
            style={{ borderColor: 'var(--border-default)' }}
          >
            <button
              onClick={() => store.generateNudges()}
              className='w-full text-xs font-semibold py-2 rounded-xl transition-all'
              style={{
                background: 'var(--brand-dimmer)',
                color: 'var(--brand)',
              }}
            >
              Refresh nudges
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function EnvelopeCard({
  env,
  fp,
  expanded,
  txnDesc,
  txnAmt,
  setTxnDesc,
  setTxnAmt,
  store,
}: any) {
  const spent = env.txns.reduce((a: number, t: any) => a + t.amt, 0);
  const rem = env.budget - spent;
  const pct = pctOf(spent, env.budget);
  const barColor =
    pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'var(--brand)';
  const remColor =
    rem < 0 ? '#ef4444' : rem < env.budget * 0.2 ? '#f59e0b' : 'var(--brand)';

  return (
    <div
      className={clsx(
        'card overflow-hidden transition-all',
        expanded && 'outline outline-1 outline-offset-0',
      )}
      style={expanded ? { outlineColor: 'var(--brand-dim)' } : {}}
    >
      <div
        className='p-4 cursor-pointer select-none'
        onClick={() => store.setExpandedEnvelope(expanded ? null : env.id)}
      >
        <div className='flex justify-between items-start mb-3'>
          <div className='flex items-center gap-3'>
            <div
              className='icon-tile'
              style={{ background: `${CAT_COLORS[env.cat]}18` }}
            >
              <span>{CAT_ICONS[env.cat]}</span>
            </div>
            <div>
              <p
                className='text-[15px] font-bold leading-tight'
                style={{ color: 'var(--text-primary)' }}
              >
                {env.name}
              </p>
              <p
                className='text-xs font-medium mt-0.5'
                style={{ color: 'var(--text-muted)' }}
              >
                {env.cat}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p
              className='text-[15px] font-bold'
              style={{ color: 'var(--text-primary)' }}
            >
              {fp(spent)}
            </p>
            <p
              className='text-xs mt-0.5'
              style={{ color: 'var(--text-muted)' }}
            >
              of {fp(env.budget)}
            </p>
          </div>
        </div>
        <div
          className='h-1.5 rounded-full overflow-hidden mb-2'
          style={{ background: 'var(--bg-input)' }}
        >
          <div
            className='h-full rounded-full transition-all duration-500'
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-xs font-semibold' style={{ color: remColor }}>
            {rem < 0 ? `Over by ${fp(-rem)}` : `${fp(rem)} left`}
          </span>
          <div className='flex items-center gap-2'>
            <span className='text-xs' style={{ color: 'var(--text-muted)' }}>
              {pct}%
            </span>
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
          className='border-t px-4 pt-3 pb-4'
          style={{
            borderColor: 'var(--border-default)',
            background: 'var(--bg-card-alt)',
          }}
        >
          <div className='flex gap-2 mb-3'>
            <input
              className='input flex-1 h-9 text-xs'
              placeholder='Description'
              value={txnDesc[env.id] ?? ''}
              onChange={(e) =>
                setTxnDesc((p: any) => ({ ...p, [env.id]: e.target.value }))
              }
              onKeyDown={(e: any) => {
                if (e.key !== 'Enter') return;
                const desc = txnDesc[env.id]?.trim(),
                  amount = parseFloat(txnAmt[env.id] ?? '');
                if (!desc || isNaN(amount) || amount <= 0) return;
                store.addTransaction(env.id, {
                  name: desc,
                  amt: amount,
                  date: new Date().toISOString().split('T')[0],
                });
                setTxnDesc((p: any) => ({ ...p, [env.id]: '' }));
                setTxnAmt((p: any) => ({ ...p, [env.id]: '' }));
              }}
            />
            <input
              className='input flex-none w-24 h-9 text-xs'
              type='number'
              placeholder='Amount'
              inputMode='decimal'
              value={txnAmt[env.id] ?? ''}
              onChange={(e) =>
                setTxnAmt((p: any) => ({ ...p, [env.id]: e.target.value }))
              }
            />
            <button
              className='btn-primary h-9 px-3 text-xs whitespace-nowrap'
              onClick={() => {
                const desc = txnDesc[env.id]?.trim(),
                  amount = parseFloat(txnAmt[env.id] ?? '');
                if (!desc || isNaN(amount) || amount <= 0) return;
                store.addTransaction(env.id, {
                  name: desc,
                  amt: amount,
                  date: new Date().toISOString().split('T')[0],
                });
                setTxnDesc((p: any) => ({ ...p, [env.id]: '' }));
                setTxnAmt((p: any) => ({ ...p, [env.id]: '' }));
              }}
            >
              + Add
            </button>
          </div>
          {env.txns.length === 0 ? (
            <p className='text-xs py-2' style={{ color: 'var(--text-muted)' }}>
              No expenses yet
            </p>
          ) : (
            env.txns.map((t: any) => (
              <div key={t.id} className='row-item'>
                <div
                  className='w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm'
                  style={{ background: 'var(--bg-input)' }}
                >
                  {CAT_ICONS[env.cat]}
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className='text-xs font-semibold truncate'
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t.name}
                  </p>
                  {t.date && (
                    <p
                      className='text-[10px] mt-0.5'
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t.date}
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className='text-xs font-bold'
                    style={{ color: '#ef4444' }}
                  >
                    -{fp(t.amt)}
                  </span>
                  <button onClick={() => store.removeTransaction(env.id, t.id)}>
                    <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            ))
          )}
          <button
            onClick={() => store.removeEnvelope(env.id)}
            className='mt-3 text-xs font-semibold flex items-center gap-1'
            style={{ color: '#ef4444' }}
          >
            <Trash2 size={11} /> Delete envelope
          </button>
        </div>
      )}
    </div>
  );
}

function AddEnvelopeModal({ onClose }: { onClose: () => void }) {
  const store = useKurotStore();
  const [name, setName] = useState('');
  const [cat, setCat] = useState<any>('Food');
  const [budget, setBudget] = useState('');
  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0)
      return;
    store.addEnvelope({ name: name.trim(), cat, budget: parseFloat(budget) });
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <h3
        className='font-serif text-lg font-semibold mb-4'
        style={{ color: 'var(--text-primary)' }}
      >
        New Envelope
      </h3>
      <div className='space-y-3'>
        <div>
          <label className='label'>Envelope name</label>
          <input
            className='input'
            placeholder='e.g. Groceries'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className='label'>Category</label>
          <select
            className='input'
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className='label'>Budget amount</label>
          <input
            className='input'
            type='number'
            placeholder='5000'
            inputMode='numeric'
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
      </div>
      <div className='flex gap-2 mt-5'>
        <button
          onClick={onClose}
          className='h-11 px-5 text-sm font-semibold rounded-xl border'
          style={{
            borderColor: 'var(--border-strong)',
            color: 'var(--text-muted)',
          }}
        >
          Cancel
        </button>
        <button onClick={submit} className='btn-primary flex-1 h-11'>
          Add envelope
        </button>
      </div>
    </Modal>
  );
}
