'use client';

import { Avatar, Badge, Button, Group, Stack, Text, Tooltip } from '@mantine/core';

import type { ShellUser } from './shell-types';

interface ShellUserMenuProps {
  collapsed?: boolean;
  onSignOut?: (() => void) | undefined;
  signingOut?: boolean | undefined;
  user?: ShellUser | undefined;
}

export function ShellUserMenu({
  collapsed = false,
  onSignOut,
  signingOut,
  user
}: ShellUserMenuProps) {
  const name = user?.name ?? 'User';
  const initialLetter = name.charAt(0).toUpperCase();

  if (collapsed) {
    return (
      <Stack gap="xs" align="center">
        <Tooltip label={name} position="right">
          <Avatar radius="xl" size="sm" style={{ background: 'var(--tt-crimson)', color: '#fff', fontWeight: 800 }}>
            {initialLetter}
          </Avatar>
        </Tooltip>
        {onSignOut ? (
          <Button
            variant="outline"
            size="xs"
            loading={Boolean(signingOut)}
            onClick={onSignOut}
            styles={{ root: { borderColor: 'rgba(155, 27, 48, 0.4)', color: '#ef4444' } }}
          >
            Exit
          </Button>
        ) : null}
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <Avatar radius="xl" size="sm" style={{ background: 'var(--tt-crimson)', color: '#fff', fontWeight: 800 }}>
            {initialLetter}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Text size="xs" fw={800} truncate style={{ color: 'var(--tt-cream)' }}>
              {name}
            </Text>
            <Text size="xs" style={{ color: 'var(--tt-gold-light)', fontSize: '0.68rem' }}>
              {user?.role ?? 'Active user'}
            </Text>
          </div>
        </Group>
        {user?.badge ? (
          <Badge size="xs" styles={{ root: { background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)', flexShrink: 0 } }}>
            {user.badge}
          </Badge>
        ) : null}
      </Group>

      {onSignOut ? (
        <Button
          variant="outline"
          size="xs"
          fullWidth
          loading={Boolean(signingOut)}
          onClick={onSignOut}
          styles={{ root: { borderColor: 'rgba(155, 27, 48, 0.4)', color: '#ef4444', '&:hover': { background: 'rgba(155, 27, 48, 0.15)' } } }}
        >
          Sign Out
        </Button>
      ) : null}
    </Stack>
  );
}
