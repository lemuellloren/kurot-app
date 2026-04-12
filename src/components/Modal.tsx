'use client';
import { useEffect } from 'react';
import clsx from 'clsx';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  onClose,
  children,
  className,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const maxW =
    size === 'sm'
      ? 'lg:max-w-sm'
      : size === 'lg'
        ? 'lg:max-w-2xl'
        : 'lg:max-w-lg';

  return (
    <div
      className='fixed inset-0 z-50'
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      {/* ── MOBILE: bottom sheet ── */}
      <div className='lg:hidden absolute inset-0 flex flex-col justify-end'>
        <div
          className={clsx(
            'w-full rounded-t-md flex flex-col',
            'max-h-[92dvh]',
            className,
          )}
          style={{ background: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className='flex-shrink-0 pt-3 pb-1 flex justify-center'>
            <div
              className='w-9 h-1 rounded-full'
              style={{ background: 'var(--border-strong)' }}
            />
          </div>

          {/* Scrollable content */}
          <div
            className='overflow-y-auto overscroll-contain px-5 pt-2 pb-28'
            style={{
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: centered dialog ── */}
      <div
        className='hidden lg:flex absolute inset-0 items-center justify-center p-6'
        onClick={onClose}
      >
        <div
          className={clsx(
            'w-full rounded-md flex flex-col max-h-[90dvh] shadow-2xl',
            maxW,
            className,
          )}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable content */}
          <div className='overflow-y-auto overscroll-contain px-6 py-5'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
