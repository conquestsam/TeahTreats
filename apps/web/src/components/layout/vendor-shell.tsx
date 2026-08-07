'use client';

import { Badge, Button, Group, Text } from '@mantine/core';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TeahTreatsLogo } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsLogo';

interface VendorShellProps {
  children: React.ReactNode;
  userName?: string | undefined;
  signingOut?: boolean | undefined;
  onSignOut: () => void;
}

const vendorLinks = [
  { href: '/vendor/dashboard', label: 'Dashboard' },
  { href: '/vendor/products', label: 'Products' },
  { href: '/vendor/inventory', label: 'Inventory' },
  { href: '/vendor/orders', label: 'Orders' }
];

export function VendorShell({ children, userName, signingOut, onSignOut }: VendorShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF7F2]">
      <header className="sticky top-0 z-30 border-b border-[rgba(184,147,62,0.12)] bg-[#111111]/90 backdrop-blur-xl">
        <div className="admin-container py-2.5">
          <Group justify="space-between">
            <Group gap="sm">
              <TeahTreatsLogo />
              <div style={{ paddingLeft: 8, borderLeft: '1px solid rgba(184, 147, 62, 0.2)' }}>
                <Text fw={800} size="sm" style={{ color: 'var(--tt-gold-light)' }}>Vendor Suite</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>
                  {userName ?? 'Vendor'}
                </Text>
              </div>
            </Group>
            <Group gap="xs" className="hidden md:flex">
              {vendorLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href as never}
                    variant={active ? 'filled' : 'subtle'}
                    size="xs"
                    styles={{
                      root: {
                        background: active ? 'linear-gradient(135deg, rgba(155, 27, 48, 0.4), rgba(107, 15, 31, 0.6))' : 'transparent',
                        border: active ? '1px solid rgba(184, 147, 62, 0.3)' : '1px solid transparent',
                        color: active ? 'var(--tt-cream)' : 'var(--tt-cream-muted)',
                        '&:hover': {
                          background: active ? 'linear-gradient(135deg, rgba(155, 27, 48, 0.5), rgba(107, 15, 31, 0.7))' : 'rgba(184, 147, 62, 0.08)'
                        }
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
              <Badge size="xs" styles={{ root: { background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)' } }}>
                Live
              </Badge>
              <Button
                variant="outline"
                size="xs"
                loading={Boolean(signingOut)}
                onClick={onSignOut}
                styles={{ root: { borderColor: 'rgba(155, 27, 48, 0.4)', color: '#ef4444' } }}
              >
                Sign Out
              </Button>
            </Group>
          </Group>
        </div>
      </header>
      <motion.main initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        {children}
      </motion.main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(184,147,62,0.12)] bg-[#111111]/95 p-2 backdrop-blur-xl md:hidden">
        <Group grow gap="xs">
          {vendorLinks.slice(0, 4).map((link) => {
            const active = pathname === link.href;
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href as never}
                size="xs"
                styles={{
                  root: {
                    background: active ? 'rgba(155, 27, 48, 0.3)' : 'transparent',
                    color: active ? 'var(--tt-gold-light)' : 'var(--tt-cream-dim)'
                  }
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Group>
      </nav>
    </div>
  );
}


