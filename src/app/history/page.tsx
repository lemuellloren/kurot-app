'use client';
import { useKurotStore, CAT_COLORS } from '@/store';
import { formatCurrency } from '@/lib/utils';
import HeroCard from '@/components/HeroCard';
import { Clock } from 'lucide-react';

export default function HistoryPage() {
  const { history, currency, saveSnapshot } = useKurotStore();
  const fp = (n: number) => formatCurrency(n, currency);

  return (
    <>
      <div className='p-3.5 space-y-3'>
        <HeroCard
          eyebrow='Monthly History'
          title='Your spending over time'
          subtitle={`${history.length} month${history.length !== 1 ? 's' : ''} recorded`}
        />

        <div className='flex justify-between items-center px-1'>
          <span className='section-title'>Snapshots</span>
          <button
            onClick={saveSnapshot}
            className='btn-secondary text-xs py-1.5 px-3'
          >
            Save This Month
          </button>
        </div>

        {history.length === 0 ? (
          <div className='card p-8 text-center'>
            <Clock size={32} className='text-green-700/20 mx-auto mb-2' />
            <p className='text-sm text-green-700/50'>No history yet</p>
            <p className='text-xs text-green-700/35 mt-1'>
              Save a snapshot to start tracking progress.
            </p>
          </div>
        ) : (
          history.map((h) => {
            const ts = h.snapshots.reduce((a, e) => a + e.spent, 0);
            const max = Math.max(...h.snapshots.map((e) => e.spent), 1);
            const savingsRate =
              h.income > 0
                ? Math.max(0, Math.round(((h.income - ts) / h.income) * 100))
                : 0;
            return (
              <div key={h.month} className='card p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <p className='text-[15px] font-bold text-green-900'>
                      {h.month}
                    </p>
                    <p className='text-xs text-green-700/50 mt-0.5'>
                      {fp(ts)} spent · {savingsRate}% savings rate
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-green-700/40'>Income</p>
                    <p className='text-sm font-bold text-green-800'>
                      {fp(h.income)}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  {h.snapshots.map((e) => (
                    <div key={e.name} className='flex items-center gap-2'>
                      <div className='w-[88px] text-xs text-green-700/60 font-medium truncate flex-shrink-0'>
                        {e.name}
                      </div>
                      <div className='flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{
                            width: `${Math.round((e.spent / max) * 100)}%`,
                            background: CAT_COLORS[e.cat] ?? '#5F5E5A',
                          }}
                        />
                      </div>
                      <div className='w-16 text-xs font-semibold text-green-900 text-right flex-shrink-0'>
                        {fp(e.spent)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals footer */}
                <div className='mt-3 pt-3 border-t border-green-800/[0.07] flex justify-between text-xs'>
                  <span className='text-green-700/50'>Total spent</span>
                  <span className='font-bold text-green-900'>{fp(ts)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
