import { Badge, Group, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { teahTreatsTokens } from '@/lib/design/tokens';

interface AppStatusShellProps {
  children: ReactNode;
  footerLinks?: Array<{ label: string; href: string }>;
  statusLabel?: string;
  variant?: 'admin' | 'customer' | 'system';
}

const defaultFooterLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Security Controls', href: '/admin/security' }
];

export function AppStatusShell({
  children,
  footerLinks = defaultFooterLinks,
  statusLabel = 'Global Systems: Normal',
  variant = 'system'
}: AppStatusShellProps) {
  const dashboardHref = variant === 'customer' ? '/account' : '/admin/dashboard';

  return (
    <main
      className="min-h-dvh px-4 py-4 sm:px-6 sm:py-6"
      style={{
        background:
          'radial-gradient(circle at 50% 42%, rgba(155,27,48,0.1), transparent 26rem), radial-gradient(circle at 70% 65%, rgba(184,147,62,0.1), transparent 28rem), #080808',
        color: teahTreatsTokens.color.cream,
        fontFamily: teahTreatsTokens.font.sans
      }}
    >
      <div
        className="mx-auto flex min-h-[calc(100dvh-32px)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border"
        style={{
          background: 'rgba(13, 13, 13, 0.95)',
          borderColor: teahTreatsTokens.color.border,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.42)'
        }}
      >
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[rgba(184,147,62,0.12)] px-4 py-3 sm:px-6">
          <Group gap="sm" wrap="nowrap">
            <Link
              href={dashboardHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-black"
              style={{
                borderColor: teahTreatsTokens.color.border,
                color: teahTreatsTokens.color.goldLight,
                fontFamily: teahTreatsTokens.font.editorial
              }}
            >
              T
            </Link>
            <Group gap="xs" wrap="nowrap">
              <Text
                fw={800}
                style={{
                  color: teahTreatsTokens.color.cream,
                  fontFamily: teahTreatsTokens.font.editorial,
                  fontSize: 'clamp(1rem, 3.8vw, 1.2rem)'
                }}
              >
                TeahTreats
              </Text>
              <Badge
                size="xs"
                radius="sm"
                styles={{
                  root: {
                    background: 'rgba(250, 247, 242, 0.08)',
                    color: teahTreatsTokens.color.creamMuted,
                    border: '1px solid rgba(250, 247, 242, 0.1)'
                  }
                }}
              >
                Enterprise
              </Badge>
            </Group>
          </Group>

          <Badge
            size="sm"
            radius="xl"
            className="hidden sm:inline-flex"
            styles={{
              root: {
                background: 'rgba(250, 247, 242, 0.06)',
                color: teahTreatsTokens.color.creamMuted,
                border: '1px solid rgba(250, 247, 242, 0.08)'
              },
              label: { letterSpacing: '0.08em' }
            }}
          >
            <span style={{ color: teahTreatsTokens.color.goldLight }}>•</span> Network operational
          </Badge>
        </header>

        <section className="grid flex-1 place-items-center px-4 py-16 sm:px-8 sm:py-20">
          <div className="w-full">{children}</div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[rgba(184,147,62,0.08)] px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Text size="xs" style={{ color: teahTreatsTokens.color.creamDim }}>
            TeshTreats Inc. © 2025 Global Culinary Operations. All rights reserved.
          </Text>
          <Stack gap={6} className="sm:items-end">
            <Text size="xs" fw={700} style={{ color: teahTreatsTokens.color.creamMuted, letterSpacing: '0.06em' }}>
              <span style={{ color: teahTreatsTokens.color.goldLight }}>•</span> {statusLabel}
            </Text>
            <Group gap="md">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href as never} style={{ color: teahTreatsTokens.color.creamDim }}>
                  {link.label}
                </Link>
              ))}
            </Group>
          </Stack>
        </footer>
      </div>
    </main>
  );
}
