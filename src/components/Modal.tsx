'use client';
import { useEffect } from 'react';
import clsx from 'clsx';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
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
    // Prevent body scroll when modal is open
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
      className='fixed inset-0 z-50 flex'
      // Mobile: bottom sheet — items aligned to bottom center
      // Desktop: centered dialog
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      {/* Mobile bottom sheet */}
      <div
        className={clsx(
          // Mobile: slides up from bottom, full width capped at 430px
          'lg:hidden flex items-end justify-center w-full absolute bottom-0 left-0 right-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsx(
            'w-full max-w-[430px] mx-auto max-h-[92dvh] overflow-y-auto rounded-t-md',
            className,
          )}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-default)',
          }}
        >
          {/* Handle bar */}
          <div
            className='w-9 h-1 rounded-full mx-auto mt-3 mb-1'
            style={{ background: 'var(--border-strong)' }}
          />
          <div className='px-5 pb-6 pt-3'>{children}</div>
        </div>
      </div>

      {/* Desktop centered dialog */}
      <div
        className='hidden lg:flex items-center justify-center w-full p-4'
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsx(
            'w-full rounded-md max-h-[90dvh] overflow-y-auto shadow-2xl',
            maxW,
            className,
          )}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
          }}
        >
          <div className='px-6 py-5'>{children}</div>
        </div>
      </div>
    </div>
  );
}
