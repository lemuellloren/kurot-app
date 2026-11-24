'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div
      className='w-full min-h-dvh flex flex-col items-center justify-center p-8 text-center'
      style={{ background: 'var(--bg-page)' }}
    >
      <div
        className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden'
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Image src='/logo-icon.svg' alt='Kurot' width={44} height={44} />
      </div>
      <h1
        className='font-serif text-3xl font-bold mb-2'
        style={{ color: 'var(--text-primary)' }}
      >
        Oops!
      </h1>
      <p className='text-sm mb-6' style={{ color: 'var(--text-muted)' }}>
        This page doesn&apos;t exist.
      </p>
      <Link href='/' className='btn-primary px-8 py-3 text-sm font-bold'>
        Go to Budget
      </Link>
    </div>
  );
}
