'use client';

import Link from 'next/link';

interface TeahTreatsLogoProps {
  href?: string;
  linked?: boolean;
}

function LogoContent() {
  return (
    <img
      src="/brand/teshtreats-logo.jpeg"
      alt="TeshTreats LLC Signature"
      className="tt-logo-image"
      width={168}
      height={104}
    />
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
