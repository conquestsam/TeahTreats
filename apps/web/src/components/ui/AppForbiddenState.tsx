'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';

import { teahTreatsTokens } from '@/lib/design/tokens';
import { AppStateActionLink } from './AppStateActionLink';
import { AppStatusShell } from './AppStatusShell';

interface AppForbiddenStateProps {
  title?: string;
  description?: string;
  actorName?: string;
  actorRole?: string;
  requiredCapability?: string;
  tenantLabel?: string;
  dashboardHref?: string;
  variant?: 'admin' | 'customer' | 'system';
}

export function AppForbiddenState({
  title = 'Access restricted',
  description = 'You do not have permission to view this section.',
  actorName,
  actorRole,
  requiredCapability,
  tenantLabel,
  dashboardHref = '/admin/dashboard',
  variant = 'admin'
}: AppForbiddenStateProps) {
  return (
    <AppStatusShell variant={variant} statusLabel="Access check needed">
      <section className="mx-auto max-w-4xl text-center">
        <Stack align="center" gap="md">
          <div className="grid h-24 w-24 place-items-center rounded-full border border-dashed border-[rgba(184,147,62,0.35)]">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[rgba(250,247,242,0.08)] text-3xl text-[var(--tt-gold-light)]">
              !
            </div>
          </div>
          <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.goldLight, letterSpacing: '0.1em' }}>
            • Access restricted
          </Text>
          <Title order={1} style={{ color: teahTreatsTokens.color.cream, fontFamily: teahTreatsTokens.font.editorial }}>
            {title}
          </Title>
          <Text maw={680} style={{ color: teahTreatsTokens.color.creamMuted, lineHeight: 1.7 }}>
            {description}
          </Text>

          {(actorName || requiredCapability || tenantLabel) && (
            <div className="mt-6 w-full rounded-xl border p-5 text-left" style={{ borderColor: teahTreatsTokens.color.border, background: 'rgba(250,247,242,0.045)' }}>
              <Group justify="space-between" gap="md" align="start">
                <Stack gap={4}>
                  {actorName && <Text fw={800} style={{ color: teahTreatsTokens.color.cream }}>{actorName}</Text>}
                  {actorRole && <Text size="sm" style={{ color: teahTreatsTokens.color.creamMuted }}>{actorRole}</Text>}
                </Stack>
                {tenantLabel && (
                  <Text size="xs" fw={800} style={{ color: teahTreatsTokens.color.goldLight }}>
                    • {tenantLabel}
                  </Text>
                )}
              </Group>
              {requiredCapability && (
                <div className="mt-5 rounded-lg bg-[rgba(0,0,0,0.2)] p-4">
                  <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.creamDim, letterSpacing: '0.08em' }}>
                    Required capability
                  </Text>
                  <Text mt={4} size="sm" style={{ color: '#ffc4ca' }}>
                    {requiredCapability}
                  </Text>
                </div>
              )}
            </div>
          )}

          <Group justify="center" mt="lg">
            <AppStateActionLink href={dashboardHref}>Return to dashboard</AppStateActionLink>
          </Group>
        </Stack>
      </section>
    </AppStatusShell>
  );
}
