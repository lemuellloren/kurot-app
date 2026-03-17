import type { KurotState, Envelope, Goal, Debt, RecurringEntry, Transaction, Category } from '@/store'

// ─── helpers ────────────────────────────────────────────────────────────────

function escapeCell(value: string | number | boolean | undefined | null): string {
  const str = value === null || value === undefined ? '' : String(value)
  // Wrap in quotes if it contains comma, newline, or double-quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(...cells: (string | number | boolean | undefined | null)[]): string {
  return cells.map(escapeCell).join(',')
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let cur = ''
  let inQuotes = false
  let cells: string[] = []

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      cells.push(cur); cur = ''
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
      if (ch === '\r') i++
      cells.push(cur); cur = ''
      rows.push(cells); cells = []
    } else {
      cur += ch
    }
  }
  if (cur || cells.length) { cells.push(cur); rows.push(cells) }
  return rows
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export type ExportSection = 'transactions' | 'envelopes' | 'goals' | 'debt' | 'recurring' | 'all'

/**
 * Exports all Kurot data as a single multi-sheet CSV bundle
 * (one section per "sheet", separated by a blank line + section header).
 * Can also export individual sections.
 */
export function exportCSV(state: KurotState, section: ExportSection = 'all'): void {
  const ts = today()

  if (section === 'transactions' || section === 'all') {
    exportTransactions(state, section === 'transactions')
  }
  if (section === 'envelopes' || section === 'all') {
    exportEnvelopes(state, section === 'envelopes')
  }
  if (section === 'goals' || section === 'all') {
    exportGoals(state, section === 'goals')
  }
  if (section === 'debt' || section === 'all') {
    exportDebts(state, section === 'debt')
  }
  if (section === 'recurring' || section === 'all') {
    exportRecurring(state, section === 'recurring')
  }

  // For 'all': also export a single combined file
  if (section === 'all') {
    const combined = buildCombinedCSV(state)
    downloadCSV(`kurot-backup-${ts}.csv`, combined)
  }
}

function exportTransactions(state: KurotState, standalone: boolean): void {
  const lines: string[] = [
    row('envelope_name', 'envelope_category', 'envelope_budget', 'txn_description', 'txn_amount', 'txn_date'),
  ]
  state.envelopes.forEach(env => {
    env.txns.forEach(t => {
      lines.push(row(env.name, env.cat, env.budget, t.name, t.amt, t.date))
    })
  })
  if (standalone) downloadCSV(`kurot-transactions-${today()}.csv`, lines.join('\n'))
}

function exportEnvelopes(state: KurotState, standalone: boolean): void {
  const lines: string[] = [
    row('name', 'category', 'budget', 'spent', 'remaining', 'txn_count'),
  ]
  state.envelopes.forEach(env => {
    const spent = env.txns.reduce((a, t) => a + t.amt, 0)
    lines.push(row(env.name, env.cat, env.budget, spent, env.budget - spent, env.txns.length))
  })
  if (standalone) downloadCSV(`kurot-envelopes-${today()}.csv`, lines.join('\n'))
}

function exportGoals(state: KurotState, standalone: boolean): void {
  const lines: string[] = [
    row('name', 'target_amount', 'current_amount', 'remaining', 'progress_pct', 'start_date', 'target_date', 'notes', 'contribution_count'),
  ]
  state.goals.forEach(g => {
    const pct = g.targetAmount > 0 ? Math.round(g.currentAmount / g.targetAmount * 100) : 0
    lines.push(row(g.name, g.targetAmount, g.currentAmount, Math.max(0, g.targetAmount - g.currentAmount), `${pct}%`, g.startDate, g.targetDate, g.notes, g.contributions.length))
  })

  // Also export contributions detail
  lines.push('')
  lines.push(row('goal_name', 'contribution_amount', 'contribution_date', 'note'))
  state.goals.forEach(g => {
    g.contributions.forEach(c => {
      lines.push(row(g.name, c.amount, c.date, c.note))
    })
  })

  if (standalone) downloadCSV(`kurot-goals-${today()}.csv`, lines.join('\n'))
}

function exportDebts(state: KurotState, standalone: boolean): void {
  const lines: string[] = [
    row('type', 'name', 'description', 'total_amount', 'remaining_amount', 'paid_amount', 'progress_pct', 'due_date', 'status', 'notes'),
  ]
  state.debts.forEach(d => {
    const paid = d.totalAmount - d.remainingAmount
    const pct  = d.totalAmount > 0 ? Math.round(paid / d.totalAmount * 100) : 0
    lines.push(row(d.type, d.name, d.description, d.totalAmount, d.remainingAmount, paid, `${pct}%`, d.dueDate, d.status, d.notes))
  })

  // Also export payment history
  lines.push('')
  lines.push(row('debt_name', 'debt_type', 'payment_amount', 'payment_date', 'note'))
  state.debts.forEach(d => {
    d.payments.forEach(p => {
      lines.push(row(d.name, d.type, p.amount, p.date, p.note))
    })
  })

  if (standalone) downloadCSV(`kurot-debt-${today()}.csv`, lines.join('\n'))
}

function exportRecurring(state: KurotState, standalone: boolean): void {
  const lines: string[] = [
    row('name', 'type', 'amount', 'category', 'frequency', 'next_due', 'active'),
  ]
  state.recurringEntries.forEach(r => {
    lines.push(row(r.name, r.type, r.amount, r.category, r.frequency, r.nextDue, r.active))
  })
  if (standalone) downloadCSV(`kurot-recurring-${today()}.csv`, lines.join('\n'))
}

function buildCombinedCSV(state: KurotState): string {
  const sections: string[] = []

  // ── Profile ──
  sections.push('## PROFILE')
  sections.push(row('user_name', 'income', 'currency'))
  sections.push(row(state.userName, state.income, state.currency))

  // ── Envelopes ──
  sections.push('')
  sections.push('## ENVELOPES')
  sections.push(row('name', 'category', 'budget', 'spent', 'remaining'))
  state.envelopes.forEach(env => {
    const spent = env.txns.reduce((a, t) => a + t.amt, 0)
    sections.push(row(env.name, env.cat, env.budget, spent, env.budget - spent))
  })

  // ── Transactions ──
  sections.push('')
  sections.push('## TRANSACTIONS')
  sections.push(row('envelope_name', 'envelope_category', 'envelope_budget', 'txn_description', 'txn_amount', 'txn_date'))
  state.envelopes.forEach(env => {
    env.txns.forEach(t => {
      sections.push(row(env.name, env.cat, env.budget, t.name, t.amt, t.date))
    })
  })

  // ── Goals ──
  sections.push('')
  sections.push('## GOALS')
  sections.push(row('name', 'target_amount', 'current_amount', 'remaining', 'progress_pct', 'start_date', 'target_date', 'notes'))
  state.goals.forEach(g => {
    const pct = g.targetAmount > 0 ? Math.round(g.currentAmount / g.targetAmount * 100) : 0
    sections.push(row(g.name, g.targetAmount, g.currentAmount, Math.max(0, g.targetAmount - g.currentAmount), `${pct}%`, g.startDate, g.targetDate, g.notes))
  })

  sections.push('')
  sections.push('## GOAL_CONTRIBUTIONS')
  sections.push(row('goal_name', 'amount', 'date', 'note'))
  state.goals.forEach(g => {
    g.contributions.forEach(c => sections.push(row(g.name, c.amount, c.date, c.note)))
  })

  // ── Debt ──
  sections.push('')
  sections.push('## DEBT_RECEIVABLES')
  sections.push(row('type', 'name', 'description', 'total_amount', 'remaining_amount', 'due_date', 'status', 'notes'))
  state.debts.forEach(d => {
    sections.push(row(d.type, d.name, d.description, d.totalAmount, d.remainingAmount, d.dueDate, d.status, d.notes))
  })

  sections.push('')
  sections.push('## DEBT_PAYMENTS')
  sections.push(row('debt_name', 'debt_type', 'amount', 'date', 'note'))
  state.debts.forEach(d => {
    d.payments.forEach(p => sections.push(row(d.name, d.type, p.amount, p.date, p.note)))
  })

  // ── Recurring ──
  sections.push('')
  sections.push('## RECURRING')
  sections.push(row('name', 'type', 'amount', 'category', 'frequency', 'next_due', 'active'))
  state.recurringEntries.forEach(r => {
    sections.push(row(r.name, r.type, r.amount, r.category, r.frequency, r.nextDue, r.active))
  })

  // ── History ──
  sections.push('')
  sections.push('## HISTORY')
  sections.push(row('month', 'income', 'envelope_name', 'category', 'budget', 'spent'))
  state.history.forEach(h => {
    h.snapshots.forEach(s => sections.push(row(h.month, h.income, s.name, s.cat, s.budget, s.spent)))
  })

  return sections.join('\n')
}

// ─── IMPORT ─────────────────────────────────────────────────────────────────

export interface ImportResult {
  success: boolean
  message: string
  counts: {
    envelopes: number
    transactions: number
    goals: number
    debts: number
    recurring: number
  }
  errors: string[]
}

type ImportMode = 'merge' | 'replace'

/**
 * Parses and imports a Kurot backup CSV.
 * Returns a result object — caller must apply the state changes via the store.
 */
export function parseImportCSV(
  text: string,
  mode: ImportMode = 'merge'
): {
  result: ImportResult
  data: Partial<Pick<KurotState, 'envelopes' | 'goals' | 'debts' | 'recurringEntries' | 'userName' | 'income' | 'currency'>>
} {
  const errors: string[] = []
  const counts = { envelopes: 0, transactions: 0, goals: 0, debts: 0, recurring: 0 }

  // Split into sections by ## headers
  const sectionMap: Record<string, string[][]> = {}
  let currentSection = ''
  let skipHeader = false

  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('##')) {
      currentSection = trimmed.replace(/^##\s*/, '').trim()
      sectionMap[currentSection] = []
      skipHeader = true
      continue
    }
    if (!currentSection || !trimmed) continue

    const parsed = parseCSV(trimmed)
    if (!parsed[0] || parsed[0].every(c => !c)) continue

    if (skipHeader) {
      // First data row after ## is the column header row — skip it
      skipHeader = false
      continue
    }

    sectionMap[currentSection].push(parsed[0])
  }

  // ── Parse PROFILE ──
  let userName = ''
  let income   = 0
  let currency = '₱'

  if (sectionMap['PROFILE']?.[0]) {
    const [n, inc, cur] = sectionMap['PROFILE'][0]
    userName = n ?? ''
    income   = parseFloat(inc) || 0
    currency = cur || '₱'
  }

  // ── Parse ENVELOPES + TRANSACTIONS ──
  // Build envelope map from ENVELOPES section
  const envelopeMap: Record<string, Envelope> = {}

  ;(sectionMap['ENVELOPES'] ?? []).forEach((r, i) => {
    const [name, cat, budget] = r
    if (!name) { errors.push(`Envelopes row ${i + 1}: missing name`); return }
    const key = name.toLowerCase().trim()
    envelopeMap[key] = {
      id:     uid(),
      name:   name.trim(),
      cat:    (cat as Category) || 'Other',
      budget: parseFloat(budget) || 0,
      txns:   [],
    }
    counts.envelopes++
  })

  // Attach transactions
  ;(sectionMap['TRANSACTIONS'] ?? []).forEach((r, i) => {
    const [envName, , , desc, amt, date] = r
    if (!envName || !desc) { errors.push(`Transactions row ${i + 1}: missing envelope or description`); return }
    const key = envName.toLowerCase().trim()
    if (!envelopeMap[key]) {
      // Create envelope on-the-fly if it wasn't in ENVELOPES section
      envelopeMap[key] = { id: uid(), name: envName.trim(), cat: 'Other', budget: 0, txns: [] }
      counts.envelopes++
    }
    envelopeMap[key].txns.push({
      id:   uid(),
      name: desc.trim(),
      amt:  parseFloat(amt) || 0,
      date: date || today(),
    })
    counts.transactions++
  })

  const envelopes = Object.values(envelopeMap)

  // ── Parse GOALS ──
  const goalMap: Record<string, Goal> = {}

  ;(sectionMap['GOALS'] ?? []).forEach((r, i) => {
    const [name, targetAmount, currentAmount, , , startDate, targetDate, notes] = r
    if (!name) { errors.push(`Goals row ${i + 1}: missing name`); return }
    const key = name.toLowerCase().trim()
    goalMap[key] = {
      id:            uid(),
      name:          name.trim(),
      targetAmount:  parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      startDate:     startDate || today(),
      targetDate:    targetDate || today(),
      notes:         notes || '',
      color:         '#1a6127',
      contributions: [],
    }
    counts.goals++
  })

  ;(sectionMap['GOAL_CONTRIBUTIONS'] ?? []).forEach((r) => {
    const [goalName, amount, date, note] = r
    if (!goalName) return
    const key = goalName.toLowerCase().trim()
    if (goalMap[key]) {
      goalMap[key].contributions.push({ id: uid(), amount: parseFloat(amount) || 0, date: date || today(), note: note || '' })
    }
  })

  const goals = Object.values(goalMap)

  // ── Parse DEBT_RECEIVABLES ──
  const debtMap: Record<string, Debt> = {}

  ;(sectionMap['DEBT_RECEIVABLES'] ?? []).forEach((r, i) => {
    const [type, name, description, totalAmount, remainingAmount, dueDate, status, notes] = r
    if (!name) { errors.push(`Debt row ${i + 1}: missing name`); return }
    const key = `${type}-${name}`.toLowerCase().trim()
    debtMap[key] = {
      id:              uid(),
      type:            (type as 'owe' | 'owed') || 'owe',
      name:            name.trim(),
      description:     description || '',
      totalAmount:     parseFloat(totalAmount) || 0,
      remainingAmount: parseFloat(remainingAmount) || 0,
      dueDate:         dueDate || today(),
      status:          (status as 'active' | 'settled') || 'active',
      notes:           notes || '',
      payments:        [],
    }
    counts.debts++
  })

  ;(sectionMap['DEBT_PAYMENTS'] ?? []).forEach((r) => {
    const [debtName, debtType, amount, date, note] = r
    if (!debtName) return
    const key = `${debtType}-${debtName}`.toLowerCase().trim()
    if (debtMap[key]) {
      debtMap[key].payments.push({ id: uid(), amount: parseFloat(amount) || 0, date: date || today(), note: note || '' })
    }
  })

  const debts = Object.values(debtMap)

  // ── Parse RECURRING ──
  const recurringEntries: RecurringEntry[] = []

  ;(sectionMap['RECURRING'] ?? []).forEach((r, i) => {
    const [name, type, amount, category, frequency, nextDue, active] = r
    if (!name) { errors.push(`Recurring row ${i + 1}: missing name`); return }
    recurringEntries.push({
      id:        uid(),
      name:      name.trim(),
      type:      (type as 'income' | 'expense') || 'expense',
      amount:    parseFloat(amount) || 0,
      category:  (category as Category) || 'Other',
      frequency: (frequency as RecurringEntry['frequency']) || 'monthly',
      nextDue:   nextDue || today(),
      active:    active === 'true' || active === 'TRUE' || active === '1',
    })
    counts.recurring++
  })

  const totalImported = counts.envelopes + counts.goals + counts.debts + counts.recurring + counts.transactions
  const success = totalImported > 0 || errors.length === 0

  return {
    result: {
      success,
      message: success
        ? `Successfully imported ${counts.envelopes} envelopes, ${counts.transactions} transactions, ${counts.goals} goals, ${counts.debts} debts, ${counts.recurring} recurring entries.`
        : 'Import failed — no valid data found.',
      counts,
      errors,
    },
    data: { envelopes, goals, debts, recurringEntries, userName, income: income || undefined, currency },
  }
}

// Type guards for re-exported types used by the import parser
interface Goal {
  id: string; name: string; targetAmount: number; currentAmount: number
  startDate: string; targetDate: string; notes: string; color: string
  contributions: { id: string; amount: number; date: string; note: string }[]
}
interface Debt {
  id: string; type: 'owe' | 'owed'; name: string; description: string
  totalAmount: number; remainingAmount: number; dueDate: string
  notes: string; status: 'active' | 'settled'
  payments: { id: string; amount: number; date: string; note: string }[]
}
interface RecurringEntry {
  id: string; name: string; amount: number; type: 'income' | 'expense'
  category: Category; frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDue: string; active: boolean
}
