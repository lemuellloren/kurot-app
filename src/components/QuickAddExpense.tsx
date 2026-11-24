'use client'
import { useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { useKurotStore, CAT_ICONS } from '@/store'
import { formatCurrency } from '@/lib/utils'
import clsx from 'clsx'

/** Log an expense from anywhere in the app (floating + button / desktop top bar). */
export default function QuickAddExpense({ onClose }: { onClose: () => void }) {
  const envelopes = useKurotStore((s) => s.envelopes)
  const currency = useKurotStore((s) => s.currency)
  const addTransaction = useKurotStore((s) => s.addTransaction)

  const [envId, setEnvId] = useState(envelopes[0]?.id ?? '')
  const [desc, setDesc] = useState('')
  const [amt, setAmt] = useState('')

  const env = envelopes.find((e) => e.id === envId)
  const spent = env ? env.txns.reduce((a, t) => a + t.amt, 0) : 0
  const left = env ? env.budget - spent : 0
  const amount = parseFloat(amt)
  const valid = !!env && desc.trim().length > 0 && !isNaN(amount) && amount > 0

  const submit = () => {
    if (!valid || !env) return
    addTransaction(env.id, {
      name: desc.trim(),
      amt: amount,
      date: new Date().toISOString().split('T')[0],
    })
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h3
        className="font-serif text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Add expense
      </h3>

      {envelopes.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Create an envelope first
          </p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Expenses are logged against an envelope.
          </p>
          <Link href="/" onClick={onClose} className="btn-primary inline-block">
            Go to Budget
          </Link>
        </div>
      ) : (
        <>
          <label className="label">Amount</label>
          <div className="relative mb-4">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold"
              style={{ color: 'var(--brand-ink)' }}
            >
              {currency}
            </span>
            <input
              className="input h-14 text-2xl font-bold pl-10"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              autoFocus
            />
          </div>

          <label className="label">What was it for?</label>
          <input
            className="input mb-4"
            placeholder="e.g. Jollibee, Grab, Load"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />

          <label className="label">Envelope</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {envelopes.map((e) => (
              <button
                key={e.id}
                onClick={() => setEnvId(e.id)}
                className={clsx('chip flex items-center gap-1.5', e.id === envId && 'chip-active')}
              >
                <span>{CAT_ICONS[e.cat]}</span>
                {e.name}
              </button>
            ))}
          </div>
          {env && (
            <p
              className="text-xs mt-2"
              style={{ color: left < 0 ? '#ef4444' : 'var(--text-muted)' }}
            >
              {left < 0
                ? `Already over by ${formatCurrency(-left, currency)} in ${env.name}`
                : `${formatCurrency(left, currency)} left in ${env.name}`}
            </p>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="h-11 px-5 text-sm font-semibold rounded-xl border"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button onClick={submit} disabled={!valid} className="btn-primary flex-1 h-11 py-0">
              Add expense
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}