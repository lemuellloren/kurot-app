'use client'
import Link from 'next/link'
import { AlertTriangle, Bell, Info, RefreshCw, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useKurotStore } from '@/store'
import type { Nudge } from '@/store'

const TONE: Record<
  Nudge['severity'],
  { bg: string; border: string; fg: string; Icon: LucideIcon }
> = {
  danger: {
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.18)',
    fg: '#ef4444',
    Icon: AlertTriangle,
  },
  warning: {
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.20)',
    fg: '#f59e0b',
    Icon: Bell,
  },
  info: {
    bg: 'rgba(64,255,225,0.06)',
    border: 'rgba(64,255,225,0.16)',
    fg: 'var(--brand-ink)',
    Icon: Info,
  },
}

/** Shared nudge panel: used in the mobile sheet and the desktop dropdown. */
export default function NudgeList({ onClose }: { onClose: () => void }) {
  const nudges = useKurotStore((s) => s.nudges)
  const removeNudge = useKurotStore((s) => s.removeNudge)
  const generateNudges = useKurotStore((s) => s.generateNudges)

  const clearAll = () => nudges.forEach((n) => removeNudge(n.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3
            className="font-serif text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Smart Nudges
          </h3>
          {nudges.length > 0 && <span className="badge">{nudges.length}</span>}
        </div>
        {nudges.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.16)',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {nudges.length === 0 ? (
        <div className="py-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'var(--brand-dim)' }}
          >
            <Bell size={20} style={{ color: 'var(--brand-ink)' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            All caught up!
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            No nudges right now
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[52vh] lg:max-h-80 overflow-y-auto">
          {nudges.map((n) => {
            const tone = TONE[n.severity]
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 p-3 rounded-xl border"
                style={{ background: tone.bg, borderColor: tone.border }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <tone.Icon size={15} style={{ color: tone.fg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {n.message}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {n.date}
                  </p>
                </div>
                <button
                  onClick={() => removeNudge(n.id)}
                  aria-label="Dismiss nudge"
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div
        className="mt-4 pt-3 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <button
          onClick={generateNudges}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--brand-ink)' }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
        <Link
          href="/settings"
          onClick={onClose}
          className="text-xs font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          Manage in Settings →
        </Link>
      </div>
    </div>
  )
}