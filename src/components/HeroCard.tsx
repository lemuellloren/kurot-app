'use client'
import MobileHeader from '@/components/MobileHeader'

interface HeroCardProps {
  eyebrow: string
  title: string
  subtitle?: string
  children?: React.ReactNode
}

/**
 * Mobile page intro used by every screen.
 * Header row (brand tile, title, nudge bell) + an optional dark summary card.
 * Hidden on desktop, where the AppShell top bar carries the page title.
 */
export default function HeroCard({ eyebrow, title, subtitle, children }: HeroCardProps) {
  return (
    <div className="lg:hidden space-y-3">
      <MobileHeader eyebrow={eyebrow} title={title} />

      {children ? (
        <div className="card-hero rounded-[22px] p-4 relative overflow-hidden">
          <div
            className="absolute -top-14 -right-10 w-44 h-44 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'var(--brand)' }}
          />
          <div className="relative z-10">
            {subtitle && (
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.50)' }}>
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>
      ) : subtitle ? (
        <span className="chip inline-block">{subtitle}</span>
      ) : null}
    </div>
  )
}