'use client';
import { useState } from 'react';
import { useKurotStore } from '@/store';
import { formatCurrency, daysUntil, formatDate, pctOf } from '@/lib/utils';
import HeroCard from '@/components/HeroCard';
import Modal from '@/components/Modal';
import ProgressRing from '@/components/ProgressRing';
import { Plus, Trash2, PlusCircle, Target } from 'lucide-react';
import clsx from 'clsx';

const GOAL_COLORS = [
  '#1a6127',
  '#185FA5',
  '#854F0B',
  '#993556',
  '#534AB7',
  '#993C1D',
];

export default function GoalsPage() {
  const store = useKurotStore();
  const { goals, currency } = store;
  const fp = (n: number) => formatCurrency(n, currency);
  const [showAdd, setShowAdd] = useState(false);
  const [contributeId, setContributeId] = useState<string | null>(null);

  const active = goals.filter((g) => g.currentAmount < g.targetAmount);
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount);
  const totalSaved = goals.reduce((a, g) => a + g.currentAmount, 0);

  return (
    <>
      <div className='p-3.5 space-y-3'>
        <HeroCard
          eyebrow='Goals & Planning'
          title='Turn savings into reality'
          subtitle='Track every goal, every contribution'
        >
          <div className='grid grid-cols-3 gap-2'>
            {[
              { label: 'Active', value: active.length },
              { label: 'Completed', value: completed.length },
              { label: 'Saved', value: fp(totalSaved) },
            ].map((s) => (
              <div
                key={s.label}
                className='bg-white/10 rounded-xl px-2 py-2 text-center'
              >
                <p className='text-white/50 text-[10px] uppercase tracking-wide'>
                  {s.label}
                </p>
                <p className='text-white font-bold text-sm leading-tight mt-0.5'>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </HeroCard>

        <div className='flex justify-between items-center px-1'>
          <span className='section-title'>Active Goals</span>
          <button
            onClick={() => setShowAdd(true)}
            className='btn-secondary text-xs py-1.5 px-3 flex items-center gap-1'
          >
            <Plus size={13} /> New Goal
          </button>
        </div>

        {active.length === 0 ? (
          <div className='card p-8 text-center'>
            <Target size={32} className='text-green-700/20 mx-auto mb-2' />
            <p className='text-sm text-green-700/50'>No active goals yet</p>
            <p className='text-xs text-green-700/35 mt-1'>
              Tap &ldquo;New Goal&rdquo; to start saving
            </p>
          </div>
        ) : (
          active.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              fp={fp}
              onContribute={() => setContributeId(g.id)}
              onDelete={() => store.removeGoal(g.id)}
            />
          ))
        )}

        {completed.length > 0 && (
          <>
            <p className='section-title px-1 pt-2'>Completed 🎉</p>
            {completed.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                fp={fp}
                completed
                onContribute={() => {}}
                onDelete={() => store.removeGoal(g.id)}
              />
            ))}
          </>
        )}
      </div>

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
      {contributeId && (
        <ContributeModal
          goalId={contributeId}
          onClose={() => setContributeId(null)}
        />
      )}
    </>
  );
}

function GoalCard({
  goal: g,
  fp,
  onContribute,
  onDelete,
  completed = false,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const pct = pctOf(g.currentAmount, g.targetAmount);
  const daysLeft = daysUntil(g.targetDate);

  return (
    <div className='card overflow-hidden'>
      <div
        className='p-4 cursor-pointer select-none'
        onClick={() => setExpanded((v) => !v)}
      >
        <div className='flex items-start gap-3 mb-3'>
          <ProgressRing
            pct={pct}
            size={52}
            stroke={5}
            color={g.color}
            bg='#ddfbe1'
          >
            <span className='text-[10px] font-bold text-green-800'>{pct}%</span>
          </ProgressRing>
          <div className='flex-1 min-w-0'>
            <p className='text-[15px] font-bold text-green-900 leading-tight'>
              {g.name}
            </p>
            {g.notes && (
              <p className='text-xs text-green-700/50 mt-0.5 truncate'>
                {g.notes}
              </p>
            )}
            <p className='text-xs text-green-700/50 mt-1'>
              {fp(g.currentAmount)}{' '}
              <span className='text-green-700/35'>/ {fp(g.targetAmount)}</span>
            </p>
          </div>
          <div className='text-right flex-shrink-0'>
            {completed ? (
              <span className='text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full'>
                Done ✓
              </span>
            ) : (
              <span
                className={clsx(
                  'text-xs font-medium',
                  daysLeft < 30 ? 'text-amber-600' : 'text-green-700/50',
                )}
              >
                {daysLeft >= 0 ? `${daysLeft}d left` : 'Overdue'}
              </span>
            )}
          </div>
        </div>

        <div className='h-1.5 bg-green-100 rounded-full overflow-hidden'>
          <div
            className='h-full rounded-full transition-all duration-500'
            style={{ width: `${pct}%`, background: g.color }}
          />
        </div>
      </div>

      {expanded && (
        <div className='border-t border-green-800/10 p-4 bg-green-50/60 space-y-3'>
          <div className='grid grid-cols-2 gap-3 text-xs'>
            {[
              { label: 'Start date', value: formatDate(g.startDate) },
              { label: 'Target date', value: formatDate(g.targetDate) },
              {
                label: 'Remaining',
                value: fp(Math.max(0, g.targetAmount - g.currentAmount)),
              },
              { label: 'Contributions', value: g.contributions.length },
            ].map((f) => (
              <div key={f.label}>
                <p className='text-green-700/45'>{f.label}</p>
                <p className='font-semibold text-green-900 mt-0.5'>{f.value}</p>
              </div>
            ))}
          </div>

          {g.contributions.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-green-700/50 mb-2'>
                Recent contributions
              </p>
              <div className='space-y-0.5'>
                {[...g.contributions]
                  .reverse()
                  .slice(0, 4)
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className='flex justify-between py-1.5 border-b border-green-800/[0.07] last:border-0'
                    >
                      <span className='text-xs text-green-700/70'>
                        {c.note || 'Contribution'} · {formatDate(c.date)}
                      </span>
                      <span className='text-xs font-bold text-green-800'>
                        +{fp(c.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className='flex gap-2 pt-1'>
            {!completed && (
              <button
                onClick={onContribute}
                className='btn-primary flex-1 h-10 text-xs flex items-center justify-center gap-1'
              >
                <PlusCircle size={13} /> Contribute
              </button>
            )}
            <button
              onClick={onDelete}
              className='h-10 px-4 text-xs text-red-400 font-semibold border border-red-200 rounded-xl flex items-center gap-1'
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const store = useKurotStore();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);

  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(target)) || !targetDate) return;
    store.addGoal({
      name: name.trim(),
      targetAmount: parseFloat(target),
      startDate,
      targetDate,
      notes,
      color,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3 className='font-serif text-xl text-green-900 mb-4'>New Goal</h3>
      <div className='space-y-3'>
        <div>
          <label className='label'>Goal name</label>
          <input
            className='input'
            placeholder='e.g. Emergency Fund'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className='label'>Target amount</label>
          <input
            className='input'
            type='number'
            placeholder='100000'
            inputMode='numeric'
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className='label'>Start date</label>
            <input
              className='input'
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className='label'>Target date</label>
            <input
              className='input'
              type='date'
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className='label'>Notes</label>
          <input
            className='input'
            placeholder='What is this goal for?'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div>
          <label className='label'>Color</label>
          <div className='flex gap-2 mt-1'>
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  color === c
                    ? 'border-green-900 scale-110'
                    : 'border-transparent',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className='flex gap-2 mt-5'>
        <button
          onClick={onClose}
          className='h-12 px-5 text-sm border border-green-800/20 rounded-2xl text-green-700/70 font-semibold'
        >
          Cancel
        </button>
        <button onClick={submit} className='btn-primary flex-1 h-12'>
          Create goal
        </button>
      </div>
    </Modal>
  );
}

function ContributeModal({
  goalId,
  onClose,
}: {
  goalId: string;
  onClose: () => void;
}) {
  const store = useKurotStore();
  const goal = store.goals.find((g) => g.id === goalId)!;
  const fp = (n: number) => formatCurrency(n, store.currency);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const submit = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    store.contributeToGoal(goalId, amt, note);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3 className='font-serif text-xl text-green-900 mb-1'>Contribute</h3>
      <p className='text-sm text-green-700/60 mb-4'>
        Adding to:{' '}
        <span className='font-semibold text-green-800'>{goal.name}</span>
        <span className='text-green-700/40 ml-1'>
          · {fp(Math.max(0, goal.targetAmount - goal.currentAmount))} remaining
        </span>
      </p>
      <div className='space-y-3'>
        <div>
          <label className='label'>Amount</label>
          <input
            className='input'
            type='number'
            placeholder='1000'
            inputMode='numeric'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className='label'>Note (optional)</label>
          <input
            className='input'
            placeholder='Monthly kurot'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      <div className='flex gap-2 mt-5'>
        <button
          onClick={onClose}
          className='h-12 px-5 text-sm border border-green-800/20 rounded-2xl text-green-700/70 font-semibold'
        >
          Cancel
        </button>
        <button onClick={submit} className='btn-primary flex-1 h-12'>
          Add contribution
        </button>
      </div>
    </Modal>
  );
}
