'use client'
import { useEffect } from 'react'
import clsx from 'clsx'

interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export default function Modal({ onClose, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className={clsx(
          'bg-white rounded-t-[28px] w-full max-w-[430px] max-h-[92dvh] overflow-y-auto',
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-green-800/20 rounded-full mx-auto mt-3 mb-1" />
        <div className="px-5 pb-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  )
}
