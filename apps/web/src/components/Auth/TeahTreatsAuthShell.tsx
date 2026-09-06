'use client';

import { Badge, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface TeahTreatsAuthShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footerNote?: string;
  activeTab?: 'sign-in' | 'verification' | 'recovery' | 'help';
}

const navItems = [
  { key: 'sign-in', label: 'Sign in', href: '/login' },
  { key: 'verification', label: 'Verification', href: '/login' },
  { key: 'recovery', label: 'Recovery', href: '/login' },
  { key: 'help', label: 'Help', href: '/' }
] as const;

export function TeahTreatsAuthShell({
  children,
  eyebrow,
  title,
  description,
  footerNote = 'Your account and order details stay private.',
  activeTab = 'sign-in'
}: TeahTreatsAuthShellProps) {
  return (
    <main className="tt-auth-portal">
      <header className="tt-auth-portal-header">
        <Group gap="sm" wrap="nowrap">
          <Link href="/" className="tt-auth-wordmark">
            TeshTreats
          </Link>
          <Badge size="sm" radius="sm" className="tt-auth-portal-badge">
            Secure Access
          </Badge>
        </Group>

        <nav className="tt-auth-portal-nav" aria-label="Account help">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={item.key === activeTab ? 'tt-auth-portal-nav-link tt-auth-portal-nav-link-active' : 'tt-auth-portal-nav-link'}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Group gap="sm" wrap="nowrap" className="tt-auth-portal-status">
          <span>Protected sign in</span>
          <span className="tt-auth-portal-avatar" aria-hidden="true">T</span>
        </Group>
      </header>

      <section className="tt-auth-portal-main">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="tt-auth-portal-center"
        >
          <Stack align="center" gap="sm" mb="xl">
            <div className="tt-auth-portal-icon" aria-hidden="true">⌘</div>
            <Text size="xs" fw={900} tt="uppercase" className="tt-auth-portal-eyebrow">
              {eyebrow}
            </Text>
            <Title order={1} className="tt-auth-portal-title">
              {title}
            </Title>
            <Text className="tt-auth-portal-description">
              {description}
            </Text>
          </Stack>

          <div className="tt-auth-portal-card">
            {children}
          </div>

          <Text mt="lg" ta="center" size="sm" className="tt-auth-portal-footnote">
            {footerNote}
          </Text>
        </motion.div>
      </section>

      <footer className="tt-auth-portal-footer">
        <Group gap="xs" wrap="nowrap">
          <Link href="/" className="tt-auth-wordmark tt-auth-wordmark-small">
            TeshTreats
          </Link>
          <Text size="xs" className="tt-auth-portal-footer-copy">
            © 2026 TeahTreats. All rights reserved.
          </Text>
        </Group>
        <Group gap="lg" className="tt-auth-portal-footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/allergy-disclaimer">Allergy info</Link>
        </Group>
      </footer>
    </main>
  );
}
