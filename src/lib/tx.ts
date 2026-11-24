import type { Envelope, Category } from '@/store'

export interface TxRow {
  id: string
  name: string
  amt: number
  date: string
  envId: string
  envName: string
  cat: Category
  order: number
}

/** Flatten every envelope's expenses into one list, newest first. */
export function collectTransactions(envelopes: Envelope[]): TxRow[] {
  const rows: TxRow[] = []
  let order = 0
  envelopes.forEach((env) => {
    env.txns.forEach((t) => {
      rows.push({
        id: t.id,
        name: t.name,
        amt: t.amt,
        date: t.date,
        envId: env.id,
        envName: env.name,
        cat: env.cat,
        order: order++,
      })
    })
  })
  return rows.sort((a, b) =>
    a.date === b.date ? b.order - a.order : a.date < b.date ? 1 : -1,
  )
}

const DAY = 86400000

/** Transactions are stamped with the UTC date (see the store), so compare in UTC too. */
export function dayLabel(date: string): string {
  const then = Date.parse(date)
  if (isNaN(then)) return date
  const today = Date.parse(new Date().toISOString().split('T')[0])
  const diff = Math.round((today - then) / DAY)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Date(then).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: Math.abs(diff) > 300 ? 'numeric' : undefined,
    timeZone: 'UTC',
  })
}