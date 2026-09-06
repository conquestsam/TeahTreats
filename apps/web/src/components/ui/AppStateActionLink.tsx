import Link from 'next/link';
import type { ReactNode } from 'react';

import { teahTreatsTokens } from '@/lib/design/tokens';

interface AppStateActionLinkProps {
  children: ReactNode;
  href: string;
  variant?: 'filled' | 'subtle';
}

export function AppStateActionLink({
  children,
  href,
  variant = 'filled'
}: AppStateActionLinkProps) {
  return (
    <Link
      href={href as never}
      className="inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2 text-sm font-extrabold transition hover:brightness-110"
      style={{
        background:
          variant === 'filled'
            ? 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))'
            : 'rgba(250, 247, 242, 0.06)',
        border:
          variant === 'filled'
            ? '1px solid rgba(155,27,48,0.6)'
            : '1px solid rgba(250,247,242,0.1)',
        color: teahTreatsTokens.color.cream
      }}
    >
      {children}
    </Link>
  );
}
