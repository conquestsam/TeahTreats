'use client';

import { Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

interface StateCardProps {
  title: string;
  description?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function StateCard({
  title,
  description,
  tone = 'neutral',
  loading,
  action
}: StateCardProps) {
  return (
    <Paper
      p={{ base: 'md', sm: 'lg' }}
      style={{
        background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.92))',
        border: '1px solid rgba(184, 147, 62, 0.15)',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
      }}
    >
      <Group align="center" gap="md" wrap="nowrap">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(184,147,62,0.2)] bg-[#111111] text-[var(--tt-gold-light)]">
          {loading ? <Loader size="xs" color="yellow" /> : <span className="text-sm font-black">•</span>}
        </div>
        <Stack gap={2} className="min-w-0">
          <Title order={3} size="h5" style={{ color: 'var(--tt-cream)', fontFamily: 'var(--tt-font-editorial)' }}>
            {title}
          </Title>
          {description ? (
            <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
              {description}
            </Text>
          ) : null}
          {action?.href ? (
            <Button
              component={Link}
              href={action.href as never}
              size="xs"
              w="fit-content"
              mt={4}
              styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none', color: 'var(--tt-cream)' } }}
            >
              {action.label}
            </Button>
          ) : action ? (
            <Button
              onClick={action.onClick}
              size="xs"
              w="fit-content"
              mt={4}
              styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none', color: 'var(--tt-cream)' } }}
            >
              {action.label}
            </Button>
          ) : null}
        </Stack>
      </Group>
    </Paper>
  );
}


