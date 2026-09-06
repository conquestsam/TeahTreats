import { Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

import { teahTreatsTokens } from '@/lib/design/tokens';
import { AppStateActionLink } from './AppStateActionLink';
import { AppStatusShell } from './AppStatusShell';

export function AppNotFoundState() {
  return (
    <AppStatusShell>
      <section className="mx-auto max-w-3xl text-center">
        <Stack align="center" gap="md">
          <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.goldLight, letterSpacing: '0.1em' }}>
            • Page not found
          </Text>
          <Title order={1} style={{ color: teahTreatsTokens.color.cream, fontFamily: teahTreatsTokens.font.editorial }}>
            This page does not exist
          </Title>
          <Text maw={560} style={{ color: teahTreatsTokens.color.creamMuted, lineHeight: 1.7 }}>
            The link may be broken, or the page may have moved. Return to your dashboard or continue browsing the TeahTreats catalog.
          </Text>
          <Group justify="center" gap="sm" mt="sm">
            <AppStateActionLink href="/admin/dashboard">Return to dashboard</AppStateActionLink>
            <AppStateActionLink href="/products" variant="subtle">Browse catalog</AppStateActionLink>
          </Group>

          <div className="mt-8 w-full border-t border-[rgba(184,147,62,0.12)] pt-6">
            <Text size="xs" tt="uppercase" mb="sm" style={{ color: teahTreatsTokens.color.creamDim, letterSpacing: '0.1em' }}>
              Common destinations
            </Text>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Orders', sub: 'Active deliveries', href: '/admin/orders' },
                { label: 'Inventory', sub: 'Stock & SKUs', href: '/admin/inventory' },
                { label: 'Account', sub: 'Customer profile', href: '/account' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href as never}
                  className="rounded-lg border p-3 text-left"
                  style={{ borderColor: teahTreatsTokens.color.border, background: 'rgba(250,247,242,0.04)' }}
                >
                  <Text size="sm" fw={800} style={{ color: teahTreatsTokens.color.cream }}>{item.label}</Text>
                  <Text size="xs" style={{ color: teahTreatsTokens.color.creamDim }}>{item.sub}</Text>
                </Link>
              ))}
            </div>
          </div>
        </Stack>
      </section>
    </AppStatusShell>
  );
}
