'use client';

import Link from 'next/link';

interface TeahTreatsLogoProps {
  href?: string;
  linked?: boolean;
}

function LogoContent() {
  return (
    <>
      <span className="tt-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <circle cx="12" cy="12" r="10" fill="url(#tt-grad)" opacity="0.85" />
          <path d="M8 14c1-3 3-5 4-5s3 2 4 5" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <circle cx="10" cy="10" r="1.2" fill="#FAF7F2" opacity="0.5" />
          <circle cx="14.5" cy="9.5" r="0.8" fill="#FAF7F2" opacity="0.4" />
          <defs>
            <linearGradient id="tt-grad" x1="2" y1="2" x2="22" y2="22">
              <stop stopColor="#D4AF37" />
              <stop offset="1" stopColor="#B8933E" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      <span className="min-w-0">
        <span className="tt-logo-word">TeahTreats</span>
        <span className="tt-logo-kicker">Premium curated snacks</span>
      </span>
    </>
  );
}

export function TeahTreatsLogo({ href = '/', linked = true }: TeahTreatsLogoProps) {
  if (!linked) {
    return (
      <span className="tt-logo group min-w-0" aria-label="TeahTreats">
        <LogoContent />
      </span>
    );
  }

  return (
    <Link href={href as never} className="tt-logo group min-w-0" aria-label="TeahTreats home">
      <LogoContent />
    </Link>
  );
}