'use client';

import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import Link from 'next/link';

interface AppPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'filled' | 'light' | 'outline' | 'subtle';
  };
}

export function AppPageHeader({ eyebrow, title, description, badge, action }: AppPageHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Group
        justify="space-between"
        align="end"
        gap="lg"
        className="rounded-xl border border-[rgba(184,147,62,0.15)] bg-[#191919] p-4 shadow-lg md:p-5"
      >
        <Stack gap={4} maw={760}>
          <Group gap="xs">
            {eyebrow ? (
              <Text size="xs" fw={700} tt="uppercase" style={{ color: 'var(--tt-gold)', letterSpacing: '0.08em' }}>
                {eyebrow}
              </Text>
            ) : null}
            {badge ? (
              <Badge size="sm" styles={{ root: { background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)' } }}>
                {badge}
              </Badge>
            ) : null}
          </Group>
          <Title order={1} className="text-2xl md:text-3xl" style={{ color: 'var(--tt-cream)', fontFamily: 'var(--tt-font-editorial)' }}>
            {title}
          </Title>
          {description ? (
            <Text size="sm" maw={640} style={{ color: 'var(--tt-cream-muted)' }}>
              {description}
            </Text>
          ) : null}
        </Stack>
        {action?.href ? (
          <Button
            component={Link}
            href={action.href as never}
            size="sm"
            className="shrink-0"
            styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none', color: 'var(--tt-cream)' } }}
          >
            {action.label}
          </Button>
        ) : action ? (
          <Button
            onClick={action.onClick}
            size="sm"
            className="shrink-0"
            styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none', color: 'var(--tt-cream)' } }}
          >
            {action.label}
          </Button>
        ) : null}
      </Group>
    </motion.div>
  );
}


