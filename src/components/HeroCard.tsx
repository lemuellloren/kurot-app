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
    <div className='bg-green-800 rounded-md p-5 relative overflow-hidden mb-0 lg:hidden'>
      <div className='absolute -top-8 -right-8 w-36 h-36 bg-white/[0.04] rounded-full pointer-events-none' />
      <div className='absolute -bottom-10 -left-4 w-24 h-24 bg-white/[0.03] rounded-full pointer-events-none' />
      <div className='relative z-10'>
        <p className='text-white/50 text-[11px] tracking-[0.12em] uppercase mb-1'>
          {eyebrow}
        </p>
        <p className='font-serif text-2xl text-white leading-tight mb-0.5'>
          {title}
        </p>
        {subtitle && <p className='text-white/45 text-xs mt-1'>{subtitle}</p>}
        {children && <div className='mt-3'>{children}</div>}
      </div>
    </div>
  );
}
