'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Bell } from 'lucide-react'
import { useKurotStore } from '@/store'
import Modal from '@/components/Modal'
import NudgeList from '@/components/NudgeList'

interface MobileHeaderProps {
  eyebrow: string
  title: string
}

/** Mobile-only page header: brand tile + title on the left, nudge bell on the right. */
export default function MobileHeader({ eyebrow, title }: MobileHeaderProps) {
  const nudges = useKurotStore((s) => s.nudges)
  const [open, setOpen] = useState(false)
  const unread = nudges.filter((n) => !n.read).length

  return (
    <>
      <div className="lg:hidden flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Image src="/logo-icon.svg" alt="Kurot" width={28} height={28} />
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text-muted)' }}
              suppressHydrationWarning
            >
              {eyebrow}
            </p>
            <p
              className="text-[17px] font-bold leading-tight truncate"
              style={{ color: 'var(--text-primary)' }}
              suppressHydrationWarning
            >
              {title}
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="icon-btn flex-shrink-0"
          aria-label={unread > 0 ? `${unread} nudges` : 'Nudges'}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="badge absolute -top-1 -right-1">{unread > 9 ? '9+' : unread}</span>
          )}
        </button>
      </div>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <NudgeList onClose={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}