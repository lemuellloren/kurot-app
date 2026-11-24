'use client';
import { useKurotStore, CAT_COLORS } from '@/store';
import { formatCurrency, pctOf } from '@/lib/utils';
import HeroCard from '@/components/HeroCard';
import dynamic from 'next/dynamic';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const Doughnut = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  {
    ssr: false,
    loading: () => (
      <div
        className='h-52 flex items-center justify-center text-xs'
        style={{ color: 'var(--text-muted)' }}
      >
        Loading chart…
      </div>
    ),
  },
);

export default function BreakdownPage() {
  const { envelopes, income, currency } = useKurotStore();
  const fp = (n: number) => formatCurrency(n, currency);
  const spentEnvs = envelopes.filter(
    (e) => e.txns.reduce((a, t) => a + t.amt, 0) > 0,
  );
  const total = spentEnvs.reduce(
    (a, e) => a + e.txns.reduce((s, t) => s + t.amt, 0),
    0,
  );
  const totalBudget = envelopes.reduce((a, e) => a + e.budget, 0);

  const pieData = {
    labels: spentEnvs.map((e) => e.name),
    datasets: [
      {
        data: spentEnvs.map((e) => e.txns.reduce((a, t) => a + t.amt, 0)),
        backgroundColor: spentEnvs.map((e) => CAT_COLORS[e.cat]),
        borderWidth: 3,
        borderColor: 'transparent',
      },
    ],
  };

  return (
    <>
      <div className='p-4 space-y-4 lg:p-0 lg:space-y-5'>
        <HeroCard
          eyebrow='Spending Breakdown'
          title='Where your money goes'
          subtitle={`${fp(total)} spent this month`}
        />
        <div className='lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0'>
          <div className='card p-4'>
            <p className='section-title mb-4'>Spending by envelope</p>
            {spentEnvs.length === 0 ? (
              <div className='h-52 flex items-center justify-center'>
                <p className='text-sm' style={{ color: 'var(--text-muted)' }}>
                  No spending recorded yet
                </p>
              </div>
            ) : (
              <>
                <div className='flex flex-wrap gap-x-4 gap-y-2 mb-4'>
                  {spentEnvs.map((e) => {
                    const s = e.txns.reduce((a, t) => a + t.amt, 0);
                    return (
                      <div key={e.id} className='flex items-center gap-1.5'>
                        <div
                          className='w-2.5 h-2.5 rounded-sm flex-shrink-0'
                          style={{ background: CAT_COLORS[e.cat] }}
                        />
                        <span
                          className='text-xs font-medium'
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {e.name}{' '}
                          {total > 0 ? Math.round((s / total) * 100) : 0}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className='relative w-full h-52'>
                  <Doughnut
                    data={pieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx: any) =>
                              ` ${fp(ctx.parsed)} (${Math.round((ctx.parsed / total) * 100)}%)`,
                          },
                        },
                      },
                      cutout: '66%',
                    }}
                  />
                  <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                    <p
                      className='text-[10px] font-semibold uppercase tracking-wide'
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Total spent
                    </p>
                    <p
                      className='font-serif text-lg font-bold'
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {fp(total)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className='card p-4'>
            <p className='section-title mb-4'>Budget vs Spent</p>
            <div className='space-y-4'>
              {envelopes.map((e) => {
                const s = e.txns.reduce((a, t) => a + t.amt, 0);
                const pct = pctOf(s, e.budget);
                const col =
                  pct >= 100
                    ? '#ef4444'
                    : pct >= 80
                      ? '#f59e0b'
                      : CAT_COLORS[e.cat];
                return (
                  <div key={e.id}>
                    <div className='flex justify-between mb-1.5'>
                      <span
                        className='text-xs font-semibold'
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {e.name}
                      </span>
                      <span
                        className='text-xs'
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span
                          className='font-bold'
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {fp(s)}
                        </span>{' '}
                        / {fp(e.budget)}
                      </span>
                    </div>
                    <div
                      className='h-1.5 rounded-full overflow-hidden'
                      style={{ background: 'var(--bg-input)' }}
                    >
                      <div
                        className='h-full rounded-full transition-all duration-500'
                        style={{ width: `${pct}%`, background: col }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='card p-4'>
          <p className='section-title mb-3'>Monthly Summary</p>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            {[
              {
                label: 'Total Income',
                value: fp(income),
                color: 'var(--brand)',
              },
              {
                label: 'Total Budgeted',
                value: fp(totalBudget),
                color: 'var(--text-primary)',
              },
              { label: 'Total Spent', value: fp(total), color: '#ef4444' },
              {
                label: 'Net Remaining',
                value: fp(income - total),
                color: income - total >= 0 ? 'var(--brand)' : '#ef4444',
              },
            ].map((r) => (
              <div
                key={r.label}
                className='rounded-xl p-3'
                style={{
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p
                  className='text-[10px] font-semibold uppercase tracking-wide mb-1'
                  style={{ color: 'var(--text-muted)' }}
                >
                  {r.label}
                </p>
                <p className='text-base font-bold' style={{ color: r.color }}>
                  {r.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
