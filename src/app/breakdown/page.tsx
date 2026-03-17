'use client';
import { useKurotStore, CAT_COLORS } from '@/store';
import { formatCurrency, pctOf } from '@/lib/utils';
import HeroCard from '@/components/HeroCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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
        borderWidth: 4,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <>
      <div className='p-3.5 lg:p-0 space-y-3 lg:space-y-5'>
        <HeroCard
          eyebrow='Spending Breakdown'
          title='Where your money goes'
          subtitle={`${fp(total)} spent this month`}
        />
        <div className='lg:grid lg:grid-cols-2 lg:gap-5 space-y-3 lg:space-y-0'>
          {/* Donut chart */}
          {spentEnvs.length > 0 ? (
            <div className='card p-4'>
              {/* Legend */}
              <div className='flex flex-wrap gap-x-3 gap-y-1.5 mb-4'>
                {spentEnvs.map((e) => {
                  const s = e.txns.reduce((a, t) => a + t.amt, 0);
                  return (
                    <div
                      key={e.id}
                      className='flex items-center gap-1.5 text-xs text-green-700/70 font-medium'
                    >
                      <div
                        className='w-2.5 h-2.5 rounded-sm flex-shrink-0'
                        style={{ background: CAT_COLORS[e.cat] }}
                      />
                      {e.name} {total > 0 ? Math.round((s / total) * 100) : 0}%
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
                          label: (ctx) =>
                            ` ${fp(ctx.parsed)} (${Math.round((ctx.parsed / total) * 100)}%)`,
                        },
                      },
                    },
                    cutout: '64%',
                  }}
                />
                {/* Center label */}
                <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                  <p className='text-[10px] text-green-700/50 font-semibold uppercase tracking-wide'>
                    Total spent
                  </p>
                  <p className='font-serif text-lg text-green-900 leading-tight'>
                    {fp(total)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='card p-8 text-center'>
              <p className='text-sm text-green-700/50'>
                No spending recorded yet
              </p>
            </div>
          )}

          {/* Budget vs Spent bars */}
          <div className='card p-4 space-y-4'>
            <p className='section-title'>Budget vs Spent</p>
            {envelopes.map((e) => {
              const s = e.txns.reduce((a, t) => a + t.amt, 0);
              const pct = pctOf(s, e.budget);
              const col =
                pct >= 100
                  ? '#dc2626'
                  : pct >= 80
                    ? '#d97706'
                    : CAT_COLORS[e.cat];
              return (
                <div key={e.id}>
                  <div className='flex justify-between mb-1.5'>
                    <span className='text-xs text-green-700/70 font-medium'>
                      {e.name}
                    </span>
                    <span className='text-xs font-bold text-green-900'>
                      {fp(s)}{' '}
                      <span className='font-normal text-green-700/50'>
                        / {fp(e.budget)}
                      </span>
                    </span>
                  </div>
                  <div className='h-2 bg-green-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full rounded-full transition-all duration-500'
                      style={{ width: `${pct}%`, background: col }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly summary */}
          <div className='card p-4'>
            <p className='section-title mb-3'>Monthly Summary</p>
            <div className='space-y-0.5'>
              {[
                {
                  label: 'Total Income',
                  value: fp(income),
                  color: 'text-green-800',
                },
                {
                  label: 'Total Budgeted',
                  value: fp(totalBudget),
                  color: 'text-green-700',
                },
                {
                  label: 'Total Spent',
                  value: fp(total),
                  color: 'text-red-600',
                },
                {
                  label: 'Net Remaining',
                  value: fp(income - total),
                  color:
                    income - total >= 0 ? 'text-green-700' : 'text-red-600',
                },
                {
                  label: 'Savings Rate',
                  value: `${pctOf(income - total, income)}%`,
                  color: 'text-green-700',
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className='flex justify-between items-center py-2 border-b border-green-800/[0.07] last:border-0'
                >
                  <span className='text-xs text-green-700/60'>{r.label}</span>
                  <span className={`text-sm font-bold ${r.color}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* end desktop grid */}
      </div>
    </>
  );
}
