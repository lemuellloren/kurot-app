interface MoneyProps {
  value: number
  currency: string
  className?: string
}

/** Large currency figure with the cents visually de-emphasised, e.g. ₱34,141.23 */
export default function Money({ value, currency, className }: MoneyProps) {
  const negative = value < 0
  const [whole, cents] = Math.abs(value).toFixed(2).split('.')
  return (
    <span className={className}>
      {negative ? '-' : ''}
      {currency}
      {Number(whole).toLocaleString('en-US')}
      <span style={{ opacity: 0.45 }}>.{cents}</span>
    </span>
  )
}