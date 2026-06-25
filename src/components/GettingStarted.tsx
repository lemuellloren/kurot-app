'use client';
import { useState } from 'react';
import { useKurotStore } from '@/store';
import {
  ChevronRight,
  Wallet,
  Target,
  CreditCard,
  RefreshCw,
  Check,
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

const STEPS = [
  {
    id: 'welcome',
    icon: null,
    title: 'Welcome to Kurot',
    subtitle: 'Set aside a little for every need.',
    desc: 'Kurot is an envelope budgeting app inspired by the Filipino tradition of magkurot ng pera — setting aside small portions of money for specific needs.',
  },
  {
    id: 'name',
    icon: null,
    title: "What's your name?",
    subtitle: "We'll personalize your experience.",
    desc: null,
  },
  {
    id: 'income',
    icon: Wallet,
    title: 'Monthly income',
    subtitle: "We'll use this to track your budget.",
    desc: 'Enter your total take-home pay per month. You can change this anytime in Settings.',
  },
  {
    id: 'features',
    icon: null,
    title: 'Everything you need',
    subtitle: "Here's what Kurot can do for you.",
    desc: null,
  },
  {
    id: 'done',
    icon: Check,
    title: "You're all set!",
    subtitle: 'Start budgeting the kurot way.',
    desc: null,
  },
];

const FEATURES = [
  {
    Icon: Wallet,
    color: '#40FFE1',
    label: 'Envelopes',
    desc: 'Allocate money to specific spending categories',
  },
  {
    Icon: Target,
    color: '#a78bfa',
    label: 'Goals',
    desc: 'Save toward trips, funds, and big purchases',
  },
  {
    Icon: CreditCard,
    color: '#f472b6',
    label: 'Debt',
    desc: "Track what you owe and what's owed to you",
  },
  {
    Icon: RefreshCw,
    color: '#fb923c',
    label: 'Recurring',
    desc: 'Auto-track salary, bills, and subscriptions',
  },
];

const CURRENCIES = [
  { symbol: '₱', label: 'Philippine Peso' },
  { symbol: '$', label: 'US Dollar' },
  { symbol: '€', label: 'Euro' },
  { symbol: '₩', label: 'Korean Won' },
  { symbol: '¥', label: 'Japanese Yen' },
  { symbol: '£', label: 'British Pound' },
];

export default function GettingStarted({ onDone }: { onDone: () => void }) {
  const store = useKurotStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('45000');
  const [currency, setCurrency] = useState('₱');
  const [leaving, setLeaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      // Save and close
      store.setUserName(name.trim() || 'Friend');
      const inc = parseFloat(income);
      if (!isNaN(inc) && inc > 0) store.setIncome(inc);
      store.setCurrency(currency);
      store.generateNudges();
      setLeaving(true);
      setTimeout(onDone, 400);
      return;
    }
    setStep((s) => s + 1);
  };

  const canNext = () => {
    if (current.id === 'name') return name.trim().length > 0;
    if (current.id === 'income') return parseFloat(income) > 0;
    return true;
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400',
        leaving ? 'opacity-0' : 'opacity-100',
      )}
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className='w-full max-w-sm mx-4 rounded-2xl overflow-hidden flex flex-col'
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          maxHeight: '90dvh',
        }}
      >
        {/* Progress bar */}
        <div className='h-1 w-full' style={{ background: 'var(--bg-input)' }}>
          <div
            className='h-full rounded-full transition-all duration-500'
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: 'var(--brand)',
            }}
          />
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          {/* ── Welcome step ── */}
          {current.id === 'welcome' && (
            <div className='flex flex-col items-center text-center py-4'>
              <div
                className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden'
                style={{
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <Image
                  src='/logo-icon.svg'
                  alt='Kurot'
                  width={52}
                  height={52}
                />
              </div>
              <p
                className='font-serif text-2xl font-bold mb-2'
                style={{ color: 'var(--text-primary)' }}
              >
                {current.title}
              </p>
              <p
                className='text-sm font-medium mb-4'
                style={{ color: 'var(--brand)' }}
              >
                {current.subtitle}
              </p>
              <p
                className='text-sm leading-relaxed'
                style={{ color: 'var(--text-muted)' }}
              >
                {current.desc}
              </p>
              <div
                className='mt-6 w-full rounded-xl p-4 text-left'
                style={{
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p
                  className='text-xs font-bold uppercase tracking-wider mb-3'
                  style={{ color: 'var(--text-muted)' }}
                >
                  What you&apos;ll get
                </p>
                <div className='space-y-2'>
                  {[
                    'Envelope budgeting',
                    'Smart nudges',
                    'Savings goals',
                    'Debt tracking',
                    '100% offline & private',
                  ].map((f) => (
                    <div key={f} className='flex items-center gap-2'>
                      <div
                        className='w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0'
                        style={{ background: 'var(--brand-dim)' }}
                      >
                        <Check size={10} style={{ color: 'var(--brand)' }} />
                      </div>
                      <span
                        className='text-xs font-medium'
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Name step ── */}
          {current.id === 'name' && (
            <div className='py-4'>
              <p
                className='font-serif text-2xl font-bold mb-1'
                style={{ color: 'var(--text-primary)' }}
              >
                {current.title}
              </p>
              <p
                className='text-sm mb-6'
                style={{ color: 'var(--text-muted)' }}
              >
                {current.subtitle}
              </p>
              <label className='label'>First name</label>
              <input
                className='input'
                placeholder='e.g. Maria'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && canNext() && handleNext()
                }
                autoFocus
              />
              {name.trim() && (
                <div
                  className='mt-4 rounded-xl p-3 flex items-center gap-3'
                  style={{
                    background: 'var(--brand-dimmer)',
                    border: '1px solid rgba(64,255,225,0.12)',
                  }}
                >
                  <div
                    className='w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0'
                    style={{
                      background: 'var(--brand)',
                      color: 'var(--brand-text)',
                    }}
                  >
                    {name.trim()[0].toUpperCase()}
                  </div>
                  <div>
                    <p
                      className='text-sm font-bold'
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Hi, {name.trim()}!
                    </p>
                    <p
                      className='text-xs'
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Nice to meet you 👋
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Income step ── */}
          {current.id === 'income' && (
            <div className='py-4'>
              <p
                className='font-serif text-2xl font-bold mb-1'
                style={{ color: 'var(--text-primary)' }}
              >
                {current.title}
              </p>
              <p
                className='text-sm mb-6'
                style={{ color: 'var(--text-muted)' }}
              >
                {current.subtitle}
              </p>

              <div className='mb-4'>
                <label className='label'>Currency</label>
                <div className='grid grid-cols-3 gap-2'>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.symbol}
                      onClick={() => setCurrency(c.symbol)}
                      className='py-2.5 rounded-xl border text-xs font-bold transition-all'
                      style={
                        currency === c.symbol
                          ? {
                              background: 'var(--brand-dim)',
                              borderColor: 'var(--brand)',
                              color: 'var(--brand)',
                            }
                          : {
                              borderColor: 'var(--border-default)',
                              color: 'var(--text-muted)',
                            }
                      }
                    >
                      {c.symbol} {c.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='label'>Monthly take-home pay</label>
                <div className='relative'>
                  <span
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold'
                    style={{ color: 'var(--brand)' }}
                  >
                    {currency}
                  </span>
                  <input
                    className='input pl-8'
                    type='number'
                    inputMode='numeric'
                    placeholder='45000'
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && canNext() && handleNext()
                    }
                  />
                </div>
                <p
                  className='text-xs mt-2'
                  style={{ color: 'var(--text-muted)' }}
                >
                  You can update this anytime in Settings.
                </p>
              </div>
            </div>
          )}

          {/* ── Features step ── */}
          {current.id === 'features' && (
            <div className='py-4'>
              <p
                className='font-serif text-2xl font-bold mb-1'
                style={{ color: 'var(--text-primary)' }}
              >
                {current.title}
              </p>
              <p
                className='text-sm mb-6'
                style={{ color: 'var(--text-muted)' }}
              >
                {current.subtitle}
              </p>
              <div className='space-y-3'>
                {FEATURES.map(({ Icon, color, label, desc }) => (
                  <div
                    key={label}
                    className='flex items-start gap-3 p-3.5 rounded-xl border'
                    style={{
                      background: 'var(--bg-card-alt)',
                      borderColor: 'var(--border-default)',
                    }}
                  >
                    <div
                      className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0'
                      style={{ background: `${color}18` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div>
                      <p
                        className='text-sm font-bold'
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {label}
                      </p>
                      <p
                        className='text-xs mt-0.5 leading-relaxed'
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Done step ── */}
          {current.id === 'done' && (
            <div className='flex flex-col items-center text-center py-4'>
              <div
                className='w-16 h-16 rounded-2xl flex items-center justify-center mb-5'
                style={{
                  background: 'var(--brand-dim)',
                  border: '1px solid rgba(64,255,225,0.2)',
                }}
              >
                <Check size={28} style={{ color: 'var(--brand)' }} />
              </div>
              <p
                className='font-serif text-2xl font-bold mb-2'
                style={{ color: 'var(--text-primary)' }}
              >
                {current.title}
              </p>
              <p className='text-sm mb-1' style={{ color: 'var(--brand)' }}>
                {current.subtitle}
              </p>
              {name && (
                <p
                  className='text-sm mt-3'
                  style={{ color: 'var(--text-muted)' }}
                >
                  Welcome aboard,{' '}
                  <span
                    className='font-bold'
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {name.trim()}
                  </span>
                  ! 🎉
                </p>
              )}
              <div
                className='mt-6 w-full rounded-xl p-4 text-left'
                style={{
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p
                  className='text-xs font-bold uppercase tracking-wider mb-3'
                  style={{ color: 'var(--text-muted)' }}
                >
                  Quick tips
                </p>
                <div className='space-y-2.5'>
                  {[
                    'Tap an envelope to log expenses',
                    'Set goals and contribute monthly',
                    'Check nudges for spending alerts',
                    'Save a snapshot at month end',
                  ].map((tip, i) => (
                    <div key={i} className='flex items-start gap-2'>
                      <span
                        className='text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'
                        style={{
                          background: 'var(--brand)',
                          color: 'var(--brand-text)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className='text-xs'
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {tip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 pb-6 pt-2 flex-shrink-0'>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={clsx(
              'w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
              canNext() ? 'active:scale-95' : 'opacity-40 cursor-not-allowed',
            )}
            style={{
              background: 'var(--brand)',
              color: 'var(--brand-text)',
              boxShadow: canNext() ? 'var(--shadow-brand)' : 'none',
            }}
          >
            {isLast ? 'Start budgeting' : 'Continue'}
            {!isLast && <ChevronRight size={16} />}
          </button>

          {/* Step dots */}
          <div className='flex justify-center gap-1.5 mt-4'>
            {STEPS.map((_, i) => (
              <div
                key={i}
                className='rounded-full transition-all duration-300'
                style={{
                  width: i === step ? 16 : 6,
                  height: 6,
                  background:
                    i === step ? 'var(--brand)' : 'var(--border-strong)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
