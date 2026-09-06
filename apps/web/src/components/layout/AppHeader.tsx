'use client';

import { ActionIcon, Avatar, Badge, Burger, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';

import { TeahTreatsLogo } from '@/components/TeahTreatsStorefront/TeahTreatsLogo';
import type { ShellUser, ShellVariant } from './shell-types';

interface AppHeaderProps {
  actions?: ReactNode;
  mobileMenuOpen?: boolean;
  navigation?: ReactNode;
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
  statusLabel?: string;
  storeLabel?: string;
  storeSubLabel?: string;
  title?: string;
  user?: ShellUser | undefined;
  variant?: ShellVariant;
}

export function AppHeader({
  actions,
  mobileMenuOpen = false,
  navigation,
  onMobileMenuToggle,
  showMobileMenu = true,
  statusLabel = 'Network operational',
  storeLabel = 'Lagos Flagship',
  storeSubLabel = 'Victoria Island',
  title,
  user,
  variant = 'admin'
}: AppHeaderProps) {
  const router = useRouter();
  const containerClass = variant === 'customer' ? 'tt-container' : 'admin-container';
  const isAdmin = variant === 'admin';
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get('admin-search') ?? '').trim();
    if (query) {
      router.push(`/admin/orders?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.08)] bg-[#0b0b0b]/95 backdrop-blur-xl">
      <div className={`${containerClass} py-2.5`}>
        <Group justify="space-between" gap="sm" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" className="min-w-0">
            <TeahTreatsLogo href={variant === 'customer' ? '/' : `/${variant}/dashboard`} />
            {isAdmin ? (
              <>
                <Badge size="sm" radius="sm" styles={{ root: { background: 'rgba(184,147,62,0.12)', color: 'var(--tt-gold-light)', border: '1px solid rgba(184,147,62,0.18)' } }}>
                  Ops
                </Badge>
                <div className="hidden min-w-[220px] rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111] px-3 py-2 text-sm text-[var(--tt-cream-muted)] md:block">
                  <span className="text-emerald-400">●</span> <strong style={{ color: 'var(--tt-cream)' }}>{storeLabel}</strong>{' '}
                  <span className="text-[var(--tt-cream-dim)]">— {storeSubLabel}</span>
                </div>
              </>
            ) : null}
            {title ? (
              <Text size="sm" fw={800} truncate className="hidden sm:block" style={{ color: 'var(--tt-gold-light)' }}>
                {title}
              </Text>
            ) : null}
          </Group>

          {navigation ? <div className="hidden min-w-0 flex-1 justify-center lg:flex">{navigation}</div> : null}

          <Group gap="sm" wrap="nowrap" className="min-w-0">
            {isAdmin ? (
              <>
                <form onSubmit={submitSearch} className="hidden min-w-[280px] max-w-[420px] flex-1 items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111] px-3 py-2 text-sm text-[var(--tt-cream-dim)] lg:flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    aria-label="Search admin workspace"
                    name="admin-search"
                    placeholder="Search order, product, customer..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-[var(--tt-cream)] outline-none placeholder:text-[var(--tt-cream-dim)]"
                    type="search"
                  />
                </form>
                <div className="hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111] px-3 py-2 text-sm text-[var(--tt-cream-muted)] xl:block">
                  <span style={{ color: 'var(--tt-gold-light)' }}>●</span> Shift active: <strong style={{ color: 'var(--tt-cream)' }}>Morning Bake</strong>
                </div>
                <ActionIcon component={Link} href="/admin/notifications" variant="subtle" aria-label="Open notifications" className="hidden sm:inline-flex" style={{ color: 'var(--tt-cream-muted)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </ActionIcon>
              </>
            ) : null}
            <Text size="xs" fw={800} className="hidden sm:block" style={{ color: 'var(--tt-cream-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--tt-gold-light)' }}>•</span> {statusLabel}
            </Text>
            {actions}
            {isAdmin && user ? (
              <Link href="/admin/settings" className="hidden sm:flex no-underline">
                <Group gap="xs" wrap="nowrap">
                  <Avatar size="sm" radius="xl" style={{ background: 'var(--tt-crimson)', color: 'var(--tt-cream)', fontWeight: 900 }}>
                    {user.badge ?? user.name?.slice(0, 2).toUpperCase() ?? 'TT'}
                  </Avatar>
                  <div className="hidden min-w-0 xl:block">
                    <Text size="sm" fw={850} truncate style={{ color: 'var(--tt-cream)', lineHeight: 1.1 }}>
                      {user.name ?? 'Admin User'}
                    </Text>
                    <Text size="xs" fw={800} tt="uppercase" truncate style={{ color: 'var(--tt-gold-light)', fontSize: '0.62rem', letterSpacing: '0.08em' }}>
                      {user.role ?? 'Operations'}
                    </Text>
                  </div>
                </Group>
              </Link>
            ) : null}
            {showMobileMenu ? (
              <Burger
                opened={mobileMenuOpen}
                onClick={onMobileMenuToggle}
                hiddenFrom="lg"
                aria-label="Open navigation"
                color="var(--tt-cream)"
                size="sm"
              />
            ) : null}
          </Group>
        </Group>
      </div>
    </header>
  );
}
