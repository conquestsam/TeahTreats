'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { stateCardReveal } from '@/lib/animation/motion-presets';
import { teahTreatsTokens } from '@/lib/design/tokens';
import { AppStateActionLink } from './AppStateActionLink';

interface StateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SetupStep {
  title: string;
  description: string;
  actionLabel?: string;
}

interface AppEmptyStateProps {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: ReactNode;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
  tertiaryAction?: StateAction;
  setupSteps?: SetupStep[];
}

function StateButton({ action, variant = 'filled' }: { action: StateAction; variant?: 'filled' | 'subtle' }) {
  const styles = {
    root: {
      minHeight: 46,
      background:
        variant === 'filled'
          ? 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))'
          : 'rgba(250, 247, 242, 0.04)',
      border: variant === 'filled' ? '1px solid rgba(155,27,48,0.6)' : '1px solid rgba(250,247,242,0.1)',
      color: teahTreatsTokens.color.cream
    }
  };

  if (action.href) {
    return <AppStateActionLink href={action.href} variant={variant}>{action.label}</AppStateActionLink>;
  }

  return (
    <Button onClick={action.onClick} styles={styles}>
      {action.label}
    </Button>
  );
}

export function AppEmptyState({
  eyebrow = 'Active query zero',
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  setupSteps
}: AppEmptyStateProps) {
  return (
    <Stack gap="xl" className="mx-auto w-full max-w-5xl">
      <motion.section
        {...stateCardReveal}
        className="mx-auto w-full max-w-4xl rounded-2xl border px-5 py-12 text-center sm:px-10 sm:py-16"
        style={{
          background:
            'linear-gradient(180deg, rgba(29,29,29,0.92), rgba(20,20,20,0.9)), radial-gradient(circle at center, rgba(184,147,62,0.08), transparent 22rem)',
          borderColor: teahTreatsTokens.color.border,
          boxShadow: teahTreatsTokens.shadow.card
        }}
      >
        <Stack align="center" gap="md">
          <Text size="xs" fw={800} tt="uppercase" style={{ color: teahTreatsTokens.color.goldLight, letterSpacing: '0.12em' }}>
            • {eyebrow}
          </Text>
          <div
            className="grid h-20 w-20 place-items-center rounded-2xl border"
            style={{ borderColor: teahTreatsTokens.color.border, background: 'rgba(250,247,242,0.04)' }}
          >
            {icon ?? <span className="text-3xl" style={{ color: teahTreatsTokens.color.goldLight }}>⊙</span>}
          </div>
          <Title order={1} style={{ color: teahTreatsTokens.color.cream, fontFamily: teahTreatsTokens.font.editorial }}>
            {title}
          </Title>
          <Text maw={620} style={{ color: teahTreatsTokens.color.creamMuted, lineHeight: 1.7 }}>
            {description}
          </Text>
          {(primaryAction || secondaryAction) && (
            <Group justify="center" gap="sm" mt="sm">
              {primaryAction && <StateButton action={primaryAction} />}
              {secondaryAction && <StateButton action={secondaryAction} variant="subtle" />}
            </Group>
          )}
          {tertiaryAction?.href ? (
            <AppStateActionLink href={tertiaryAction.href} variant="subtle">{tertiaryAction.label}</AppStateActionLink>
          ) : tertiaryAction ? (
            <Button variant="subtle" size="xs" onClick={tertiaryAction.onClick}>
              {tertiaryAction.label}
            </Button>
          ) : null}
        </Stack>
      </motion.section>

      {setupSteps?.length ? (
        <section>
          <Group justify="space-between" mb="md" gap="sm">
            <Text size="xs" fw={900} tt="uppercase" style={{ color: teahTreatsTokens.color.goldLight, letterSpacing: '0.08em' }}>
              Setup lifecycle
            </Text>
            <Text size="sm" style={{ color: teahTreatsTokens.color.creamMuted }}>
              Step 0 of {setupSteps.length} ready
            </Text>
          </Group>
          <div className="grid gap-4 md:grid-cols-3">
            {setupSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-xl border p-5"
                style={{ borderColor: teahTreatsTokens.color.border, background: 'rgba(250,247,242,0.045)' }}
              >
                <Group justify="space-between" mb="lg">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[rgba(184,147,62,0.12)] text-sm font-black text-[var(--tt-gold-light)]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <Text size="xs" fw={800} style={{ color: teahTreatsTokens.color.creamDim }}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </Group>
                <Title order={3} size="h4" style={{ color: teahTreatsTokens.color.cream }}>
                  {step.title}
                </Title>
                <Text mt="xs" size="sm" style={{ color: teahTreatsTokens.color.creamMuted, lineHeight: 1.6 }}>
                  {step.description}
                </Text>
                {step.actionLabel && (
                  <Text mt="lg" size="xs" fw={800} style={{ color: teahTreatsTokens.color.creamMuted, letterSpacing: '0.04em' }}>
                    {step.actionLabel} →
                  </Text>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </Stack>
  );
}
