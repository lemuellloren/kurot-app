'use client';
import { useState } from 'react';
import { useKurotStore, CATEGORIES, CAT_ICONS } from '@/store';
import { formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic';
import HeroCard from '@/components/HeroCard';
import Modal from '@/components/Modal';
import { Plus, Trash2, RefreshCw, Bell, BellOff, User } from 'lucide-react';

const DataPortability = dynamic(() => import('@/components/DataPortability'), {
  ssr: false,
  loading: () => (
    <div className='card p-4 animate-pulse'>
      <div className='h-4 bg-green-100 rounded w-1/2 mb-2' />
      <div className='h-3 bg-green-50 rounded w-3/4' />
    </div>
  ),
});
import clsx from 'clsx';

type Tab = 'profile' | 'budgets' | 'recurring' | 'nudges';

export default function SettingsPage() {
  const store = useKurotStore();
  const {
    userName,
    income,
    currency,
    categoryBudgets,
    recurringEntries,
    nudges,
  } = store;
  const fp = (n: number) => formatCurrency(n, currency);

  const [tab, setTab] = useState<Tab>('profile');
  const [localName, setLocalName] = useState(userName);
  const [localIncome, setLocalIncome] = useState(String(income));
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [saved, setSaved] = useState(false);

  const unread = nudges.filter((n) => !n.read);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'budgets', label: 'Budgets' },
    { key: 'recurring', label: 'Recurring' },
    {
      key: 'nudges',
      label: unread.length > 0 ? `Nudges (${unread.length})` : 'Nudges',
    },
  ];

  const handleSave = () => {
    store.setUserName(localName.trim());
    const inc = parseFloat(localIncome);
    if (!isNaN(inc) && inc > 0) store.setIncome(inc);
    store.setCurrency(localCurrency);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className='p-3.5 space-y-3'>
        <HeroCard eyebrow='Settings' title='Customize Kurot' />

        {/* Tabs */}
        <div className='grid grid-cols-4 gap-1 bg-green-100 rounded-2xl p-1'>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'py-2 text-[11px] font-bold rounded-xl transition-all leading-tight',
                tab === t.key
                  ? 'bg-white text-green-800 shadow-sm'
                  : 'text-green-700/55',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className='card p-4 space-y-3'>
            <div className='flex items-center gap-3 mb-1'>
              <div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'>
                <User size={18} className='text-green-700' />
              </div>
              <div>
                <p className='text-sm font-bold text-green-900'>
                  {localName || 'Your name'}
                </p>
                <p className='text-xs text-green-700/50'>Personal profile</p>
              </div>
            </div>
            <div>
              <label className='label'>Your first name</label>
              <input
                className='input'
                placeholder='e.g. Maria'
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />
            </div>
            <div>
              <label className='label'>Monthly income</label>
              <input
                className='input'
                type='number'
                inputMode='numeric'
                value={localIncome}
                onChange={(e) => setLocalIncome(e.target.value)}
              />
            </div>
            <div>
              <label className='label'>Currency</label>
              <select
                className='input'
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value)}
              >
                {[
                  ['₱', 'Philippine Peso'],
                  ['$', 'US Dollar'],
                  ['€', 'Euro'],
                  ['₩', 'Korean Won'],
                  ['¥', 'Japanese Yen'],
                  ['£', 'British Pound'],
                ].map(([s, l]) => (
                  <option key={s} value={s}>
                    {s} {l}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              className={clsx(
                'btn-primary w-full h-11 mt-1 transition-all',
                saved && 'bg-green-600',
              )}
            >
              {saved ? '✓ Saved!' : 'Save changes'}
            </button>
          </div>
        )}

        {/* ── Category budgets ── */}
        {tab === 'budgets' && (
          <div className='space-y-2'>
            <p className='text-xs text-green-700/50 px-1 leading-relaxed'>
              Set a spending limit per category. You'll get a smart nudge when
              you're getting close.
            </p>
            {CATEGORIES.map((cat) => (
              <CategoryBudgetRow
                key={cat}
                cat={cat}
                existing={categoryBudgets.find((b) => b.category === cat)}
                currency={currency}
              />
            ))}
          </div>
        )}

        {/* ── Recurring ── */}
        {tab === 'recurring' && (
          <div className='space-y-2'>
            <div className='flex justify-between items-center px-1'>
              <p className='text-xs text-green-700/50'>
                Income and expenses that repeat automatically.
              </p>
              <button
                onClick={() => setShowAddRecurring(true)}
                className='btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0 ml-2'
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {recurringEntries.length === 0 ? (
              <div className='card p-6 text-center'>
                <RefreshCw
                  size={28}
                  className='text-green-700/20 mx-auto mb-2'
                />
                <p className='text-sm text-green-700/50'>
                  No recurring entries yet
                </p>
              </div>
            ) : (
              recurringEntries.map((r) => (
                <div key={r.id} className='card p-3.5 flex items-center gap-3'>
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                      r.type === 'income' ? 'bg-green-100' : 'bg-red-50',
                    )}
                  >
                    <RefreshCw
                      size={14}
                      className={
                        r.type === 'income' ? 'text-green-700' : 'text-red-400'
                      }
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-green-900 truncate'>
                      {r.name}
                    </p>
                    <p className='text-xs text-green-700/50 mt-0.5 capitalize'>
                      {r.type} · {r.frequency} · {fp(r.amount)}
                    </p>
                    <p className='text-[10px] text-green-700/35 mt-0.5'>
                      Next: {r.nextDue}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    {/* Toggle */}
                    <button
                      onClick={() => store.toggleRecurring(r.id)}
                      className={clsx(
                        'w-9 h-5 rounded-full transition-colors relative',
                        r.active ? 'bg-green-800' : 'bg-green-800/20',
                      )}
                    >
                      <span
                        className={clsx(
                          'w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all',
                          r.active ? 'left-[18px]' : 'left-[3px]',
                        )}
                      />
                    </button>
                    <button onClick={() => store.removeRecurring(r.id)}>
                      <Trash2 size={14} className='text-red-400' />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Nudges ── */}
        {tab === 'nudges' && (
          <div className='space-y-2'>
            <div className='flex justify-between items-center px-1'>
              <p className='text-xs text-green-700/50'>
                Smart alerts about your finances.
              </p>
              <button
                onClick={() => store.generateNudges()}
                className='btn-secondary text-xs py-1.5 px-3'
              >
                Refresh
              </button>
            </div>

            {nudges.length === 0 ? (
              <div className='card p-6 text-center'>
                <Bell size={28} className='text-green-700/20 mx-auto mb-2' />
                <p className='text-sm text-green-700/50'>No nudges right now</p>
                <p className='text-xs text-green-700/35 mt-1'>
                  You're all caught up!
                </p>
              </div>
            ) : (
              nudges.map((n) => (
                <div
                  key={n.id}
                  className={clsx(
                    'card p-3.5 flex items-start gap-3',
                    n.read && 'opacity-40',
                  )}
                >
                  <span className='text-base mt-0.5 flex-shrink-0'>
                    {n.severity === 'danger'
                      ? '🔴'
                      : n.severity === 'warning'
                        ? '🟡'
                        : '🔵'}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-green-900 leading-relaxed'>
                      {n.message}
                    </p>
                    <p className='text-[10px] text-green-700/35 mt-1'>
                      {n.date}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => store.markNudgeRead(n.id)}
                      className='flex-shrink-0'
                    >
                      <BellOff size={14} className='text-green-700/40' />
                    </button>
                  )}
                </div>
              ))
            )}

            {nudges.some((n) => n.read) && (
              <button
                onClick={store.clearReadNudges}
                className='text-xs text-green-700/50 font-semibold w-full text-center py-2'
              >
                Clear read nudges
              </button>
            )}
          </div>
        )}

        {/* Data portability — always visible regardless of tab */}
        <DataPortability />

        {/* About section always shown at bottom */}
        <div className='card p-4 mt-2'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-12 h-12 rounded-2xl bg-green-800 flex items-center justify-center flex-shrink-0'>
              <svg width='28' height='28' viewBox='0 0 512 512'>
                <circle
                  cx='256'
                  cy='256'
                  r='210'
                  fill='#f4c842'
                  opacity='0.9'
                />
                <text
                  x='256'
                  y='272'
                  textAnchor='middle'
                  fontFamily='Georgia,serif'
                  fontSize='200'
                  fontWeight='700'
                  fill='#1a6127'
                >
                  ₱
                </text>
              </svg>
            </div>
            <div>
              <p className='font-serif text-xl text-green-900'>Kurot</p>
              <p className='text-xs text-green-700/45'>
                Version 1.0.0 · Offline · Open source
              </p>
            </div>
          </div>
          <p className='text-xs text-green-700/60 leading-relaxed'>
            Inspired by the Filipino tradition of <em>magkurot ng pera</em> —
            setting aside small portions of money for specific needs. All data
            stays on your device.
          </p>
          <p className='text-xs text-green-700/40 italic mt-2'>
            "Set aside a little for every need."
          </p>
        </div>
      </div>

      {showAddRecurring && (
        <AddRecurringModal onClose={() => setShowAddRecurring(false)} />
      )}
    </>
  );
}

function CategoryBudgetRow({ cat, existing, currency }: any) {
  const store = useKurotStore();
  const [limit, setLimit] = useState(String(existing?.limit ?? ''));
  const [alertAt, setAlertAt] = useState(String(existing?.alertAt ?? '80'));
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    const l = parseFloat(limit);
    const a = parseFloat(alertAt);
    if (!isNaN(l) && l > 0) {
      store.setCategoryBudget(
        cat,
        l,
        isNaN(a) ? 80 : Math.min(100, Math.max(1, a)),
      );
      setEditing(false);
    }
  };

  return (
    <div className='card p-3.5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <span className='text-xl'>{CAT_ICONS[cat]}</span>
          <div>
            <p className='text-sm font-semibold text-green-900'>{cat}</p>
            {existing && !editing && (
              <p className='text-xs text-green-700/50 mt-0.5'>
                Limit: {formatCurrency(existing.limit, currency)} · Alert at{' '}
                {existing.alertAt}%
              </p>
            )}
            {!existing && !editing && (
              <p className='text-xs text-green-700/35 mt-0.5'>No limit set</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className='text-xs text-green-700 font-semibold px-3 py-1.5 bg-green-50 rounded-lg'
        >
          {editing ? 'Cancel' : existing ? 'Edit' : 'Set limit'}
        </button>
      </div>

      {editing && (
        <div className='mt-3 space-y-2'>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='label'>Spending limit</label>
              <input
                className='input'
                type='number'
                placeholder='10000'
                inputMode='numeric'
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <div>
              <label className='label'>Alert at (%)</label>
              <input
                className='input'
                type='number'
                placeholder='80'
                min='1'
                max='100'
                value={alertAt}
                onChange={(e) => setAlertAt(e.target.value)}
              />
            </div>
          </div>
          <div className='flex gap-2'>
            {existing && (
              <button
                onClick={() => {
                  store.removeCategoryBudget(cat);
                  setEditing(false);
                }}
                className='h-9 px-3 text-xs text-red-400 font-semibold border border-red-200 rounded-xl'
              >
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              className='btn-primary flex-1 h-9 text-xs'
            >
              Save limit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddRecurringModal({ onClose }: { onClose: () => void }) {
  const store = useKurotStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<any>('Other');
  const [frequency, setFrequency] = useState<any>('monthly');
  const [nextDue, setNextDue] = useState(
    new Date().toISOString().split('T')[0],
  );

  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(amount))) return;
    store.addRecurring({
      name: name.trim(),
      amount: parseFloat(amount),
      type,
      category,
      frequency,
      nextDue,
      active: true,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3 className='font-serif text-xl text-green-900 mb-4'>
        New Recurring Entry
      </h3>
      <div className='space-y-3'>
        <div className='flex gap-2'>
          {(['income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={clsx(
                'flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all capitalize',
                type === t
                  ? 'bg-green-800 text-white border-green-800'
                  : 'border-green-800/20 text-green-700/70',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div>
          <label className='label'>Name</label>
          <input
            className='input'
            placeholder='e.g. Netflix, Salary'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className='label'>Category</label>
            <select
              className='input'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='label'>Frequency</label>
            <select
              className='input'
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className='label'>Next due date</label>
          <input
            className='input'
            type='date'
            value={nextDue}
            onChange={(e) => setNextDue(e.target.value)}
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
          Add recurring
        </button>
      </div>
    </Modal>
  );
}
