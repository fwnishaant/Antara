import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const sizeClasses = {
    sm: 'text-lg font-bold tracking-tight',
    md: 'text-xl font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group focus:outline-none ${className}`}>
      {/* Abstract Symbol: Connection + Intelligence + Movement + Transaction Flow */}
      <div className={`relative flex items-center justify-center rounded-lg bg-zinc-900 text-teal-400 p-1.5 shadow-sm group-hover:bg-zinc-800 transition-colors ${iconSizes[size]}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-current stroke-[2.2]">
          {/* Movement vectors */}
          <path d="M4 12h16M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          {/* Intelligence node */}
          <circle cx="8" cy="12" r="2.5" className="fill-teal-400 stroke-none" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-sans tracking-tight text-zinc-900 dark:text-zinc-100 ${sizeClasses[size]}`}>
          ANTARA
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-widest text-zinc-500 font-sans -mt-1">
            Agentic Commerce
          </span>
        )}
      </div>
    </Link>
  );
};
