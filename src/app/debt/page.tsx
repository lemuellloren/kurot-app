'use client'
import { useState } from 'react'
import { useKurotStore } from '@/store'
import { formatCurrency, daysUntil, formatDate, pctOf } from '@/lib/utils'
import AppShell from '@/components/AppShell'
import HeroCard from '@/components/HeroCard'
import Modal from '@/components/Modal'
import ProgressRing from '@/components/ProgressRing'
import { Plus, Trash2, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

export default function DebtPage() {
  const store = useKurotStore()
  const { debts, currency } = store
  const fp = (n: number) => formatCurrency(n, currency)
  const [showAdd,   setShowAdd]   = useState(false)
  const [payId,     setPayId]     = useState<string | null>(null)
  const [tab,       setTab]       = useState<'owe' | 'owed'>('owe')

  const owe     = debts.filter(d => d.type === 'owe'  && d.status === 'active')
  const owed    = debts.filter(d => d.type === 'owed' && d.status === 'active')
  const settled = debts.filter(d => d.status === 'settled')
  const totalOwe  = owe.reduce((a, d)  => a + d.remainingAmount, 0)
  const totalOwed = owed.reduce((a, d) => a + d.remainingAmount, 0)

  return (
    <AppShell>
      <div className="p-3.5 space-y-3">
        <HeroCard eyebrow="Debt & Receivables" title="Track what you owe & what's owed">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.18)' }}>
              <p className="text-red-200 text-[10px] uppercase tracking-wide flex items-center gap-1">
                <TrendingDown size={10} /> You Owe
              </p>
              <p className="text-white font-bold text-base mt-0.5">{fp(totalOwe)}</p>
              <p className="text-white/45 text-[10px]">{owe.length} active</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(74,222,128,0.15)' }}>
              <p className="text-green-200 text-[10px] uppercase tracking-wide flex items-center gap-1">
                <TrendingUp size={10} /> Owed to You
              </p>
              <p className="text-white font-bold text-base mt-0.5">{fp(totalOwed)}</p>
              <p className="text-white/45 text-[10px]">{owed.length} active</p>
            </div>
          </div>
        </HeroCard>

        {/* Tabs */}
        <div className="flex bg-green-100 rounded-2xl p-1 gap-1">
          {(['owe', 'owed'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all',
                tab === t ? 'bg-white text-green-800 shadow-sm' : 'text-green-700/55'
              )}
            >
              {t === 'owe' ? `I Owe (${owe.length})` : `Owed to Me (${owed.length})`}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center px-1">
          <span className="section-title">{tab === 'owe' ? 'Debts' : 'Receivables'}</span>
          <button onClick={() => setShowAdd(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <Plus size={13} /> Add {tab === 'owe' ? 'Debt' : 'Receivable'}
          </button>
        </div>

        {(tab === 'owe' ? owe : owed).length === 0 ? (
          <div className="card p-8 text-center">
            <DollarSign size={32} className="text-green-700/20 mx-auto mb-2" />
            <p className="text-sm text-green-700/50">No {tab === 'owe' ? 'debts' : 'receivables'} tracked</p>
          </div>
        ) : (
          (tab === 'owe' ? owe : owed).map(d => (
            <DebtCard key={d.id} debt={d} fp={fp}
              onPay={() => setPayId(d.id)}
              onDelete={() => store.removeDebt(d.id)}
            />
          ))
        )}

        {settled.length > 0 && (
          <>
            <p className="section-title px-1 pt-2">Settled ✅</p>
            {settled.map(d => (
              <DebtCard key={d.id} debt={d} fp={fp} settled onPay={() => {}} onDelete={() => store.removeDebt(d.id)} />
            ))}
          </>
        )}
      </div>

      {showAdd && <AddDebtModal tab={tab} onClose={() => setShowAdd(false)} />}
      {payId   && <PayModal debtId={payId} onClose={() => setPayId(null)} />}
    </AppShell>
  )
}

function DebtCard({ debt: d, fp, onPay, onDelete, settled = false }: any) {
  const [expanded, setExpanded] = useState(false)
  const pct      = pctOf(d.totalAmount - d.remainingAmount, d.totalAmount)
  const daysLeft = daysUntil(d.dueDate)
  const isOwe    = d.type === 'owe'
  const color    = isOwe ? '#dc2626' : '#1a5c38'

  return (
    <div className="card overflow-hidden">
      <div className="p-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start gap-3 mb-3">
          <ProgressRing pct={pct} size={52} stroke={5} color={color} bg={isOwe ? '#fee2e2' : '#eaf3de'}>
            <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-green-900 leading-tight">{d.name}</p>
            {d.description && <p className="text-xs text-green-700/50 mt-0.5 truncate">{d.description}</p>}
            <p className="text-xs text-green-700/50 mt-1">
              {fp(d.remainingAmount)} <span className="text-green-700/35">remaining of {fp(d.totalAmount)}</span>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            {settled
              ? <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Settled</span>
              : (
                <span className={clsx('text-xs font-medium', daysLeft < 0 ? 'text-red-600' : daysLeft < 30 ? 'text-amber-600' : 'text-green-700/50')}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </span>
              )
            }
          </div>
        </div>

        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-green-800/10 p-4 bg-green-50/60 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Due date',       value: formatDate(d.dueDate) },
              { label: 'Payments made',  value: d.payments.length },
              { label: 'Total paid',     value: fp(d.totalAmount - d.remainingAmount) },
              { label: 'Remaining',      value: fp(d.remainingAmount) },
            ].map(f => (
              <div key={f.label}>
                <p className="text-green-700/45">{f.label}</p>
                <p className="font-semibold text-green-900 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {d.notes && <p className="text-xs text-green-700/55 italic">"{d.notes}"</p>}

          {d.payments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700/50 mb-2">Recent payments</p>
              <div className="space-y-0.5">
                {[...d.payments].reverse().slice(0, 4).map((p: any) => (
                  <div key={p.id} className="flex justify-between py-1.5 border-b border-green-800/[0.07] last:border-0">
                    <span className="text-xs text-green-700/70">
                      {p.note || 'Payment'} · {formatDate(p.date)}
                    </span>
                    <span className="text-xs font-bold text-green-800">{fp(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {!settled && (
              <button onClick={onPay} className="btn-primary flex-1 h-10 text-xs flex items-center justify-center gap-1">
                <DollarSign size={13} /> {isOwe ? 'Record Payment' : 'Record Collection'}
              </button>
            )}
            <button onClick={onDelete} className="h-10 px-4 text-xs text-red-400 font-semibold border border-red-200 rounded-xl flex items-center gap-1">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddDebtModal({ tab, onClose }: { tab: 'owe' | 'owed'; onClose: () => void }) {
  const store = useKurotStore()
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [total,       setTotal]       = useState('')
  const [dueDate,     setDueDate]     = useState('')
  const [notes,       setNotes]       = useState('')

  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(total)) || !dueDate) return
    store.addDebt({ type: tab, name: name.trim(), description, totalAmount: parseFloat(total), dueDate, notes })
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="font-serif text-xl text-green-900 mb-4">
        Add {tab === 'owe' ? 'Debt' : 'Receivable'}
      </h3>
      <div className="space-y-3">
        <div>
          <label className="label">{tab === 'owe' ? 'Creditor name' : 'Debtor name'}</label>
          <input className="input" placeholder={tab === 'owe' ? 'e.g. BDO Bank' : 'e.g. John Doe'} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div><label className="label">Description</label><input className="input" placeholder="What is this for?" value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label className="label">Total amount</label><input className="input" type="number" placeholder="50000" inputMode="numeric" value={total} onChange={e => setTotal(e.target.value)} /></div>
        <div><label className="label">Due date</label><input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        <div><label className="label">Notes</label><input className="input" placeholder="e.g. Monthly payment ₱5,000" value={notes} onChange={e => setNotes(e.target.value)} /></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="h-12 px-5 text-sm border border-green-800/20 rounded-2xl text-green-700/70 font-semibold">Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 h-12">Add {tab === 'owe' ? 'debt' : 'receivable'}</button>
      </div>
    </Modal>
  )
}

function PayModal({ debtId, onClose }: { debtId: string; onClose: () => void }) {
  const store  = useKurotStore()
  const debt   = store.debts.find(d => d.id === debtId)!
  const fp     = (n: number) => formatCurrency(n, store.currency)
  const [amount, setAmount] = useState('')
  const [note,   setNote]   = useState('')

  const submit = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    store.payDebt(debtId, amt, note)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="font-serif text-xl text-green-900 mb-1">
        {debt.type === 'owe' ? 'Record Payment' : 'Record Collection'}
      </h3>
      <p className="text-sm text-green-700/60 mb-4">
        <span className="font-semibold text-green-800">{debt.name}</span>
        <span className="text-green-700/40 ml-1">· {fp(debt.remainingAmount)} remaining</span>
      </p>
      <div className="space-y-3">
        <div><label className="label">Amount</label><input className="input" type="number" placeholder="5000" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div><label className="label">Note (optional)</label><input className="input" placeholder="Monthly payment" value={note} onChange={e => setNote(e.target.value)} /></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="h-12 px-5 text-sm border border-green-800/20 rounded-2xl text-green-700/70 font-semibold">Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 h-12">Record</button>
      </div>
    </Modal>
  )
}
