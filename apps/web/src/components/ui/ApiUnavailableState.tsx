'use client';

import { Button, Group, Progress, Stack, Text, Title } from '@mantine/core';

import { teahTreatsTokens } from '@/lib/design/tokens';
import { AppStatusShell } from './AppStatusShell';

interface ApiUnavailableStateProps {
  onRetry?: () => void;
  retryingLabel?: string;
  serviceLabel?: string;
  variant?: 'admin' | 'customer' | 'system';
}

export function ApiUnavailableState({
  onRetry,
  retryingLabel = 'Trying again',
  serviceLabel = 'TeahTreats service',
  variant = 'system'
}: ApiUnavailableStateProps) {
  return (
    <AppStatusShell variant={variant} statusLabel="We are checking the connection">
      <section className="mx-auto max-w-3xl text-center">
        <Stack align="center" gap="md">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-[rgba(250,247,242,0.04)]">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-[var(--tt-gold-light)] text-2xl text-[var(--tt-gold-light)]">
              ↻
            </div>
          </div>
          <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.goldLight, letterSpacing: '0.1em' }}>
            • Connection issue
          </Text>
          <Title order={1} style={{ color: teahTreatsTokens.color.cream, fontFamily: teahTreatsTokens.font.editorial }}>
            Connection temporarily unavailable
          </Title>
          <Text maw={640} style={{ color: teahTreatsTokens.color.creamMuted, lineHeight: 1.7 }}>
            We are having trouble reaching TeahTreats right now. Any saved drafts on this device remain safe while you reconnect.
          </Text>

          <div className="mt-5 w-full rounded-xl border p-5 text-left" style={{ borderColor: teahTreatsTokens.color.border, background: 'rgba(250,247,242,0.045)' }}>
            <Progress value={68} color="teahGold" mb="lg" />
            <Group justify="space-between" gap="sm">
              <Stack gap={2}>
                <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.creamDim, letterSpacing: '0.08em' }}>
                  Connection check
                </Text>
                <Text size="sm" fw={700} style={{ color: teahTreatsTokens.color.cream }}>
                  {retryingLabel}
                </Text>
              </Stack>
              <Button size="sm" variant="default" onClick={onRetry}>
                Retry now
              </Button>
            </Group>
            <Stack gap="xs" mt="lg">
              <Group justify="space-between">
                <Text size="sm" style={{ color: teahTreatsTokens.color.creamMuted }}>Page and images</Text>
                <Text size="xs" fw={900} c="green">Available</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" style={{ color: teahTreatsTokens.color.creamMuted }}>{serviceLabel}</Text>
                <Text size="xs" fw={900} style={{ color: teahTreatsTokens.color.goldLight }}>Reconnecting</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" style={{ color: teahTreatsTokens.color.creamMuted }}>Payments</Text>
                <Text size="xs" fw={900} style={{ color: teahTreatsTokens.color.creamDim }}>Waiting</Text>
              </Group>
            </Stack>
          </div>

          <Group justify="center" mt="lg">
            <Button onClick={onRetry} styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', color: teahTreatsTokens.color.cream } }}>
              Retry connection
            </Button>
          </Group>
        </Stack>
      </section>
    </AppStatusShell>
  );
}
