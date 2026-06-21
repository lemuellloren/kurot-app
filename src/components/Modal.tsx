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
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      {/* Mobile bottom sheet */}
      <div
        className='lg:hidden absolute inset-0 flex flex-col justify-end'
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsx(
            'w-full flex flex-col max-h-[92dvh] rounded-t-2xl',
            className,
          )}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderBottom: 'none',
          }}
        >
          <div className='flex-shrink-0 pt-3 pb-1 flex justify-center'>
            <div
              className='w-10 h-1 rounded-full'
              style={{ background: 'var(--border-strong)' }}
            />
          </div>
          <div
            className='overflow-y-auto overscroll-contain px-5 pb-8 pt-3'
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {children}
          </div>
        </div>
      </div>
      {/* Desktop centered dialog */}
      <div
        className={clsx(
          'hidden lg:flex absolute inset-0 items-center justify-center p-6',
        )}
        onClick={onClose}
      >
        <div
          className={clsx(
            'w-full rounded-2xl flex flex-col max-h-[88dvh]',
            maxW,
            className,
          )}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='overflow-y-auto overscroll-contain px-6 py-5'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
