'use client';

import { Button, Collapse, Group, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'motion/react';

import { stateCardReveal } from '@/lib/animation/motion-presets';
import { teahTreatsTokens } from '@/lib/design/tokens';
import { AppStateActionLink } from './AppStateActionLink';
import { AppStatusShell } from './AppStatusShell';

interface AppErrorStateProps {
  title?: string;
  description?: string;
  referenceId?: string;
  details?: string;
  retryLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  onRetry?: () => void;
  variant?: 'admin' | 'customer' | 'system';
}

export function AppErrorState({
  title = 'Something went wrong on our side',
  description = 'We encountered an unexpected issue while loading this view. Your session, cart items, and unsaved details remain secure.',
  referenceId = 'err_teah_unknown',
  details,
  retryLabel = 'Reload page',
  homeHref = '/admin/dashboard',
  homeLabel = 'Return to dashboard',
  onRetry,
  variant = 'system'
}: AppErrorStateProps) {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <AppStatusShell variant={variant} statusLabel="Global Systems: Attention Required">
      <motion.section {...stateCardReveal} className="mx-auto max-w-3xl text-center">
        <Stack align="center" gap="md">
          <div className="relative grid h-24 w-24 place-items-center rounded-2xl bg-[rgba(155,27,48,0.12)]">
            <div className="h-12 w-12 rounded-full border-2 border-[var(--tt-crimson-light)]" />
            <span className="absolute right-5 top-4 h-4 w-4 rounded-full bg-[var(--tt-crimson-light)]" />
          </div>
          <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.goldLight, letterSpacing: '0.1em' }}>
            • Operational notice
          </Text>
          <Title order={1} style={{ color: teahTreatsTokens.color.cream, fontFamily: teahTreatsTokens.font.editorial }}>
            {title}
          </Title>
          <Text maw={620} style={{ color: teahTreatsTokens.color.creamMuted, lineHeight: 1.7 }}>
            {description}
          </Text>
          <Group justify="center" gap="sm" mt="sm">
            <Button
              onClick={onRetry}
              styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', color: teahTreatsTokens.color.cream } }}
            >
              {retryLabel}
            </Button>
            <AppStateActionLink href={homeHref} variant="subtle">{homeLabel}</AppStateActionLink>
          </Group>

          <div
            className="mt-8 w-full rounded-xl border p-5 text-left"
            style={{ borderColor: teahTreatsTokens.color.border, background: 'rgba(250,247,242,0.045)' }}
          >
            <Group justify="space-between" gap="sm">
              <Stack gap={2}>
                <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.creamDim, letterSpacing: '0.08em' }}>
                  Telemetry reference
                </Text>
                <Text component="code" size="sm" style={{ color: teahTreatsTokens.color.goldLight }}>
                  {referenceId}
                </Text>
              </Stack>
              <Button size="xs" variant="subtle" onClick={() => navigator.clipboard?.writeText(referenceId)}>
                Copy ID
              </Button>
            </Group>
            {details ? (
              <>
                <Button mt="md" size="xs" variant="subtle" onClick={toggle}>
                  Technical diagnostic details
                </Button>
                <Collapse in={opened}>
                  <Text component="pre" mt="sm" size="xs" style={{ color: teahTreatsTokens.color.creamMuted, whiteSpace: 'pre-wrap' }}>
                    {details}
                  </Text>
                </Collapse>
              </>
            ) : null}
          </div>
        </Stack>
      </motion.section>
    </AppStatusShell>
  );
}
