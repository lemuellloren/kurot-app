import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency = '₱'): string {
  return `${currency} ${Math.round(amount).toLocaleString()}`
}

export function pctOf(part: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((part / total) * 100))
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function getCurrentMonth(): string {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

export function getGreeting(name?: string): string {
  const h = new Date().getHours()
  const base = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${base}, ${name}` : base
}
