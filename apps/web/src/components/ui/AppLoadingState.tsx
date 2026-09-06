'use client';

import { Stack, Text } from '@mantine/core';
import { motion, useReducedMotion } from 'motion/react';

import { softPulse } from '@/lib/animation/motion-presets';
import { teahTreatsTokens } from '@/lib/design/tokens';
import { AppStatusShell } from './AppStatusShell';

interface AppLoadingStateProps {
  message?: string;
  scope?: 'page' | 'panel';
  variant?: 'admin' | 'customer' | 'system';
}

export function AppLoadingState({
  message = 'Loading',
  scope = 'page',
  variant = 'system'
}: AppLoadingStateProps) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion ? {} : softPulse;
  const content = (
    <Stack align="center" gap="xs" className="mx-auto text-center">
      <motion.div
        aria-hidden
        className="relative grid h-20 w-20 place-items-center rounded-2xl"
        style={{
          background: 'rgba(250, 247, 242, 0.04)',
          boxShadow: `${teahTreatsTokens.shadow.glowGold}, ${teahTreatsTokens.shadow.glowCrimson}`
        }}
        {...motionProps}
      >
        <div
          className="h-9 w-9 rounded-[38%_62%_45%_55%] border"
          style={{
            borderColor: teahTreatsTokens.color.goldLight,
            background: 'linear-gradient(135deg, rgba(155,27,48,0.48), rgba(184,147,62,0.52))'
          }}
        />
        <div className="absolute h-3 w-3 rounded-full" style={{ background: teahTreatsTokens.color.gold }} />
      </motion.div>
      <Text
        fw={800}
        style={{
          color: teahTreatsTokens.color.cream,
          fontFamily: teahTreatsTokens.font.editorial,
          fontSize: '1.28rem'
        }}
      >
        Teah<span style={{ color: teahTreatsTokens.color.goldLight }}>Treats</span>
      </Text>
      <Text size="xs" tt="uppercase" style={{ color: teahTreatsTokens.color.creamDim, letterSpacing: '0.34em' }}>
        {message}
      </Text>
    </Stack>
  );

  if (scope === 'panel') {
    return <div className="grid min-h-[320px] place-items-center rounded-xl border border-[rgba(184,147,62,0.12)] bg-[#111] p-8">{content}</div>;
  }

  return <AppStatusShell variant={variant}>{content}</AppStatusShell>;
}
