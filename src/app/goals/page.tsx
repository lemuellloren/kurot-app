'use client';
import { useState } from 'react';
import { useKurotStore } from '@/store';
import { formatCurrency, daysUntil, formatDate, pctOf } from '@/lib/utils';
import HeroCard from '@/components/HeroCard';
import Modal from '@/components/Modal';
import ProgressRing from '@/components/ProgressRing';
import { Plus, Trash2, PlusCircle, Target, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const GOAL_COLORS = [
  '#40FFE1',
  '#a78bfa',
  '#f472b6',
  '#fb923c',
  '#34d399',
  '#60a5fa',
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
      <div className='p-4 space-y-4 lg:p-0 lg:space-y-5'>
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
                className='rounded-xl p-2.5 text-center'
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <p
                  className='text-[10px] uppercase tracking-wide'
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                >
                  {s.label}
                </p>
                <p className='text-sm font-bold text-white mt-0.5'>{s.value}</p>
              </div>
            ))}
          </div>
        </HeroCard>

        <div className='hidden lg:grid grid-cols-3 gap-4'>
          {[
            { label: 'Active Goals', value: active.length, sub: 'in progress' },
            {
              label: 'Completed',
              value: completed.length,
              sub: 'goals achieved',
            },
            {
              label: 'Total Saved',
              value: fp(totalSaved),
              sub: 'across all goals',
            },
          ].map((s) => (
            <div key={s.label} className='card p-4'>
              <p className='section-title mb-2'>{s.label}</p>
              <p
                className='font-serif text-2xl font-bold'
                style={{ color: 'var(--text-primary)' }}
              >
                {s.value}
              </p>
              <p
                className='text-xs mt-1'
                style={{ color: 'var(--text-muted)' }}
              >
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        <div className='flex justify-between items-center'>
          <p className='section-title'>Active Goals</p>
          <button
            onClick={() => setShowAdd(true)}
            className='btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5'
          >
            <Plus size={12} /> New Goal
          </button>
        </div>

        {active.length === 0 ? (
          <div className='card p-8 text-center'>
            <Target
              size={28}
              className='mx-auto mb-2'
              style={{ color: 'var(--text-muted)' }}
            />
            <p
              className='text-sm font-semibold'
              style={{ color: 'var(--text-muted)' }}
            >
              No active goals yet
            </p>
            <p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>
              Tap &ldquo;New Goal&rdquo; to start saving
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {active.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                fp={fp}
                onContribute={() => setContributeId(g.id)}
                onDelete={() => store.removeGoal(g.id)}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <>
            <p className='section-title flex items-center gap-1.5 pt-2'>
              <CheckCircle size={11} style={{ color: 'var(--brand)' }} />{' '}
              Completed
            </p>
            <div className='space-y-2'>
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
            </div>
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
    <div
      className={clsx('card overflow-hidden', expanded && 'outline outline-1')}
      style={expanded ? { outlineColor: 'var(--brand-dim)' } : {}}
    >
      <div
        className='p-4 cursor-pointer select-none'
        onClick={() => setExpanded((v) => !v)}
      >
        <div className='flex items-start gap-3'>
          <ProgressRing
            pct={pct}
            size={48}
            stroke={4}
            color={g.color}
            bg='var(--bg-input)'
          >
            <span className='text-[9px] font-black' style={{ color: g.color }}>
              {pct}%
            </span>
          </ProgressRing>
          <div className='flex-1 min-w-0'>
            <div className='flex justify-between items-start'>
              <p
                className='text-[15px] font-bold leading-tight'
                style={{ color: 'var(--text-primary)' }}
              >
                {g.name}
              </p>
              <span
                className='text-[11px] font-semibold ml-2 flex-shrink-0'
                style={{
                  color: completed
                    ? 'var(--brand)'
                    : daysLeft < 0
                      ? '#ef4444'
                      : daysLeft < 30
                        ? '#f59e0b'
                        : 'var(--text-muted)',
                }}
              >
                {completed
                  ? '✓ Done'
                  : daysLeft < 0
                    ? `${Math.abs(daysLeft)}d overdue`
                    : `${daysLeft}d left`}
              </span>
            </div>
            {g.notes && (
              <p
                className='text-xs mt-0.5 truncate'
                style={{ color: 'var(--text-muted)' }}
              >
                {g.notes}
              </p>
            )}
            <div
              className='h-1.5 rounded-full overflow-hidden mt-2'
              style={{ background: 'var(--bg-input)' }}
            >
              <div
                className='h-full rounded-full'
                style={{ width: `${pct}%`, background: g.color }}
              />
            </div>
            <div className='flex justify-between mt-1'>
              <span
                className='text-[11px]'
                style={{ color: 'var(--text-muted)' }}
              >
                {fp(g.currentAmount)}
              </span>
              <span
                className='text-[11px]'
                style={{ color: 'var(--text-muted)' }}
              >
                {fp(g.targetAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className='border-t px-4 pt-3 pb-4 space-y-3'
          style={{
            borderColor: 'var(--border-default)',
            background: 'var(--bg-card-alt)',
          }}
        >
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
                <p style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                <p
                  className='font-semibold mt-0.5'
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.value}
                </p>
              </div>
            ))}
          </div>
          {g.contributions.length > 0 && (
            <div>
              <p
                className='text-[11px] font-semibold uppercase tracking-wide mb-2'
                style={{ color: 'var(--text-muted)' }}
              >
                Recent
              </p>
              {[...g.contributions]
                .reverse()
                .slice(0, 3)
                .map((c: any) => (
                  <div key={c.id} className='row-item'>
                    <div
                      className='w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0'
                      style={{ background: `${g.color}18`, color: g.color }}
                    >
                      +
                    </div>
                    <span
                      className='text-xs flex-1 truncate'
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {c.note || 'Contribution'} · {formatDate(c.date)}
                    </span>
                    <span
                      className='text-xs font-bold'
                      style={{ color: g.color }}
                    >
                      +{fp(c.amount)}
                    </span>
                  </div>
                ))}
            </div>
          )}
          <div className='flex gap-2 pt-1'>
            {!completed && (
              <button
                onClick={onContribute}
                className='btn-primary flex-1 h-10 text-xs flex items-center justify-center gap-1.5'
              >
                <PlusCircle size={13} /> Contribute
              </button>
            )}
            <button
              onClick={onDelete}
              className='h-10 px-4 text-xs font-semibold rounded-xl border flex items-center gap-1'
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.20)' }}
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
      <h3
        className='font-serif text-lg font-semibold mb-4'
        style={{ color: 'var(--text-primary)' }}
      >
        New Goal
      </h3>
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
                  'w-7 h-7 rounded-lg border-2 transition-all',
                  color === c ? 'scale-110' : 'border-transparent',
                )}
                style={{
                  background: c,
                  borderColor:
                    color === c ? 'var(--text-primary)' : 'transparent',
                }}
              />
            ))}
          </div>
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
      <h3
        className='font-serif text-lg font-semibold mb-1'
        style={{ color: 'var(--text-primary)' }}
      >
        Contribute
      </h3>
      <p className='text-sm mb-4' style={{ color: 'var(--text-muted)' }}>
        <span
          className='font-semibold'
          style={{ color: 'var(--text-primary)' }}
        >
          {goal.name}
        </span>
        <span className='ml-1'>
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
          className='h-11 px-5 text-sm font-semibold rounded-xl border'
          style={{
            borderColor: 'var(--border-strong)',
            color: 'var(--text-muted)',
          }}
        >
          Cancel
        </button>
        <button onClick={submit} className='btn-primary flex-1 h-11'>
          Add contribution
        </button>
      </div>
    </Modal>
  );
}
