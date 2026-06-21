'use client';

interface HeroCardProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function HeroCard({
  eyebrow,
  title,
  subtitle,
  children,
}: HeroCardProps) {
  return (
    <div
      className='lg:hidden rounded-2xl p-5 relative overflow-hidden'
      style={{
        background:
          'linear-gradient(135deg, #000d0b 0%, #001a16 60%, #002a22 100%)',
        border: '1px solid rgba(64,255,225,0.10)',
      }}
    >
      <div
        className='absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15 blur-2xl pointer-events-none'
        style={{ background: 'var(--brand)' }}
      />
      <div className='relative z-10'>
        <p
          className='text-[11px] font-semibold uppercase tracking-widest mb-1'
          style={{ color: 'rgba(255,255,255,0.40)' }}
        >
          {eyebrow}
        </p>
        <p className='font-serif text-2xl font-bold text-white leading-tight'>
          {title}
        </p>
        {subtitle && (
          <p
            className='text-xs mt-1.5'
            style={{ color: 'rgba(255,255,255,0.40)' }}
          >
            {subtitle}
          </p>
        )}
        {children && <div className='mt-4'>{children}</div>}
      </div>
    </div>
  );
}
