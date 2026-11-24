'use client'
import { useState } from 'react'
import { useKurotStore } from '@/store'
import { formatCurrency, daysUntil, formatDate, pctOf } from '@/lib/utils'
import HeroCard from '@/components/HeroCard'
import Modal from '@/components/Modal'
import ProgressRing from '@/components/ProgressRing'
import { Plus, Trash2, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

export default function DebtPage() {
  const store = useKurotStore()
  const { debts, currency } = store
  const fp = (n: number) => formatCurrency(n, currency)
  const [showAdd, setShowAdd] = useState(false)
  const [payId,   setPayId]   = useState<string | null>(null)
  const [tab,     setTab]     = useState<'owe' | 'owed'>('owe')

  const owe     = debts.filter(d => d.type === 'owe'  && d.status === 'active')
  const owed    = debts.filter(d => d.type === 'owed' && d.status === 'active')
  const settled = debts.filter(d => d.status === 'settled')
  const totalOwe  = owe.reduce((a, d)  => a + d.remainingAmount, 0)
  const totalOwed = owed.reduce((a, d) => a + d.remainingAmount, 0)

  return (
    <>
      <div className="p-4 space-y-4 lg:p-0 lg:space-y-5">
        <HeroCard eyebrow="Debt & Receivables" title="Track what you owe & what's owed">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-[10px] uppercase tracking-wide flex items-center gap-1" style={{ color: 'rgba(252,165,165,0.8)' }}>
                <TrendingDown size={10} /> You Owe
              </p>
              <p className="text-white font-bold text-base mt-1">{fp(totalOwe)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{owe.length} active</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(64,255,225,0.10)', border: '1px solid rgba(64,255,225,0.12)' }}>
              <p className="text-[10px] uppercase tracking-wide flex items-center gap-1" style={{ color: 'rgba(64,255,225,0.8)' }}>
                <TrendingUp size={10} /> Owed to You
              </p>
              <p className="text-white font-bold text-base mt-1">{fp(totalOwed)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{owed.length} active</p>
            </div>
          </div>
        </HeroCard>

        <div className="hidden lg:grid grid-cols-4 gap-4">
          {[
            { label: 'Total Owed',   value: fp(totalOwe),              sub: `${owe.length} debts`,         color: '#ef4444' },
            { label: 'Owed to You',  value: fp(totalOwed),             sub: `${owed.length} receivables`,  color: 'var(--brand-ink)' },
            { label: 'Settled',      value: String(settled.length),    sub: 'total resolved',              color: 'var(--text-primary)' },
            { label: 'Net Position', value: fp(totalOwed - totalOwe),  sub: totalOwed - totalOwe >= 0 ? 'in your favour' : 'against you',
              color: totalOwed - totalOwe >= 0 ? 'var(--brand-ink)' : '#ef4444' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="section-title mb-2">{s.label}</p>
              <p className="font-serif text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-default)' }}>
          {(['owe', 'owed'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
              style={tab === t
                ? { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                : { color: 'var(--text-muted)' }}>
              {t === 'owe' ? `I Owe (${owe.length})` : `Owed to Me (${owed.length})`}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="section-title">{tab === 'owe' ? 'Debts' : 'Receivables'}</p>
          <button onClick={() => setShowAdd(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={12} /> Add {tab === 'owe' ? 'Debt' : 'Receivable'}
          </button>
        </div>

        {(tab === 'owe' ? owe : owed).length === 0 ? (
          <div className="card p-8 text-center">
            <DollarSign size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              No {tab === 'owe' ? 'debts' : 'receivables'} tracked
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(tab === 'owe' ? owe : owed).map(d => (
              <DebtCard key={d.id} debt={d} fp={fp} onPay={() => setPayId(d.id)} onDelete={() => store.removeDebt(d.id)} />
            ))}
          </div>
        )}

        {settled.length > 0 && (
          <>
            <p className="section-title pt-2">Settled ✓</p>
            <div className="space-y-2">
              {settled.map(d => (
                <DebtCard key={d.id} debt={d} fp={fp} settled onPay={() => {}} onDelete={() => store.removeDebt(d.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      {showAdd && <AddDebtModal tab={tab} onClose={() => setShowAdd(false)} />}
      {payId   && <PayModal debtId={payId} onClose={() => setPayId(null)} />}
    </>
  )
}

function DebtCard({ debt: d, fp, onPay, onDelete, settled = false }: any) {
  const [expanded, setExpanded] = useState(false)
  const pct      = pctOf(d.totalAmount - d.remainingAmount, d.totalAmount)
  const daysLeft = daysUntil(d.dueDate)
  const isOwe    = d.type === 'owe'
  const color    = isOwe ? '#ef4444' : 'var(--brand-ink)'

  return (
    <div className={clsx('card overflow-hidden', expanded && 'outline outline-1')}
      style={expanded ? { outlineColor: 'var(--brand-dim)' } : {}}>
      <div className="p-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start gap-3">
          <ProgressRing pct={pct} size={48} stroke={4} color={color} bg="var(--bg-input)">
            <span className="text-[9px] font-black" style={{ color }}>{pct}%</span>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                {d.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{d.description}</p>}
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className="text-[15px] font-bold" style={{ color }}>{fp(d.remainingAmount)}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>of {fp(d.totalAmount)}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mt-2.5 mb-1.5" style={{ background: 'var(--bg-input)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{pct}% paid off</span>
              {!settled ? (
                <span className="text-[11px] font-semibold"
                  style={{ color: daysLeft < 0 ? '#ef4444' : daysLeft < 30 ? '#f59e0b' : 'var(--text-muted)' }}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                </span>
              ) : (
                <span className="text-[11px] font-semibold" style={{ color: 'var(--brand-ink)' }}>Settled</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pt-3 pb-4 space-y-3" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card-alt)' }}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Due date',      value: formatDate(d.dueDate) },
              { label: 'Payments made', value: d.payments.length },
              { label: 'Total paid',    value: fp(d.totalAmount - d.remainingAmount) },
              { label: 'Remaining',     value: fp(d.remainingAmount) },
            ].map(f => (
              <div key={f.label}>
                <p style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
              </div>
            ))}
          </div>
          {d.notes && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>&ldquo;{d.notes}&rdquo;</p>}
          {d.payments.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Recent payments</p>
              {[...d.payments].reverse().slice(0, 3).map((p: any) => (
                <div key={p.id} className="row-item">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: isOwe ? 'rgba(239,68,68,0.10)' : 'var(--brand-dimmer)', color }}>
                    <DollarSign size={11} />
                  </div>
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {p.note || 'Payment'} · {formatDate(p.date)}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--brand-ink)' }}>{fp(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            {!settled && (
              <button onClick={onPay} className="btn-primary flex-1 h-10 text-xs flex items-center justify-center gap-1.5">
                <DollarSign size={13} /> {isOwe ? 'Record Payment' : 'Record Collection'}
              </button>
            )}
            <button onClick={onDelete} className="h-10 px-4 text-xs font-semibold rounded-xl border flex items-center gap-1"
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.20)' }}>
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
  const [name, setName] = useState(''); const [description, setDescription] = useState('')
  const [total, setTotal] = useState(''); const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const submit = () => {
    if (!name.trim() || isNaN(parseFloat(total)) || !dueDate) return
    store.addDebt({ type: tab, name: name.trim(), description, totalAmount: parseFloat(total), dueDate, notes }); onClose()
  }
  return (
    <Modal onClose={onClose}>
      <h3 className="font-serif text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Add {tab === 'owe' ? 'Debt' : 'Receivable'}
      </h3>
      <div className="space-y-3">
        <div><label className="label">{tab === 'owe' ? 'Creditor name' : 'Debtor name'}</label>
          <input className="input" placeholder={tab === 'owe' ? 'e.g. BDO Bank' : 'e.g. John Doe'} value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="label">Description</label>
          <input className="input" placeholder="What is this for?" value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label className="label">Total amount</label>
          <input className="input" type="number" placeholder="50000" inputMode="numeric" value={total} onChange={e => setTotal(e.target.value)} /></div>
        <div><label className="label">Due date</label>
          <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        <div><label className="label">Notes</label>
          <input className="input" placeholder="e.g. Monthly payment ₱5,000" value={notes} onChange={e => setNotes(e.target.value)} /></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="h-11 px-5 text-sm font-semibold rounded-xl border"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 h-11">Add {tab === 'owe' ? 'debt' : 'receivable'}</button>
      </div>
    </Modal>
  )
}

function PayModal({ debtId, onClose }: { debtId: string; onClose: () => void }) {
  const store = useKurotStore()
  const debt  = store.debts.find(d => d.id === debtId)!
  const fp    = (n: number) => formatCurrency(n, store.currency)
  const [amount, setAmount] = useState(''); const [note, setNote] = useState('')
  const submit = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    store.payDebt(debtId, amt, note); onClose()
  }
  return (
    <Modal onClose={onClose}>
      <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {debt.type === 'owe' ? 'Record Payment' : 'Record Collection'}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{debt.name}</span>
        <span className="ml-1">· {fp(debt.remainingAmount)} remaining</span>
      </p>
      <div className="space-y-3">
        <div><label className="label">Amount</label>
          <input className="input" type="number" placeholder="5000" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div><label className="label">Note (optional)</label>
          <input className="input" placeholder="Monthly payment" value={note} onChange={e => setNote(e.target.value)} /></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="h-11 px-5 text-sm font-semibold rounded-xl border"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 h-11">Record</button>
      </div>
    </Modal>
  )
}