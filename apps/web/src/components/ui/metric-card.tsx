'use client';

import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'green' | 'orange' | 'red' | 'blue' | 'gray';
  badge?: string;
}

export function MetricCard({ label, value, hint, tone = 'gray', badge }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} style={{ minWidth: 0 }}>
      <Paper
        p="md"
        className="h-full"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.92), rgba(20, 20, 20, 0.95))',
          border: '1px solid rgba(184, 147, 62, 0.15)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          minWidth: 0,
          overflow: 'hidden'
        }}
      >
        <Stack gap="xs" style={{ minWidth: 0 }}>
          <Group justify="space-between" align="start" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} style={{ color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {label}
            </Text>
            {badge ? (
              <Badge size="xs" styles={{ root: { background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)', flexShrink: 0 } }}>
                {badge}
              </Badge>
            ) : null}
          </Group>
          <Text fw={900} className="text-2xl" style={{ color: 'var(--tt-gold-light)', fontFamily: 'var(--tt-font-editorial)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}
          </Text>
          {hint ? (
            <Text size="xs" style={{ color: 'var(--tt-cream-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hint}
            </Text>
          ) : null}
        </Stack>
      </Paper>
    </motion.div>
  );
}


