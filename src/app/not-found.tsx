'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='w-full max-w-[430px] min-h-dvh bg-green-50 flex flex-col items-center justify-center p-8 text-center'>
      <div className='w-20 h-20 rounded-md bg-green-800 flex items-center justify-center mb-6'>
        <svg width='36' height='36' viewBox='0 0 512 512'>
          <circle cx='256' cy='256' r='210' fill='#40FFE1' opacity='0.92' />
          <text
            x='256'
            y='272'
            textAnchor='middle'
            fontFamily='Poppins,sans-serif'
            fontSize='200'
            fontWeight='700'
            fill='#011412'
          >
            ₱
          </text>
        </svg>
      </div>
      <h1 className='font-serif text-3xl text-green-900 mb-2'>Oops!</h1>
      <p className='text-green-700/60 text-sm mb-6'>This page doesn't exist.</p>
      <Link
        href='/'
        className='btn-primary px-8 py-3 text-sm font-bold bg-green-800 text-white rounded-md'
      >
        Go to Budget
      </Link>
    </div>
  );
}
