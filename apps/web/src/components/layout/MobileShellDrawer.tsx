'use client';

import { Button, Drawer, Stack, Text } from '@mantine/core';
import Link from 'next/link';

import type { ShellNavSection, ShellUser } from './shell-types';
import { ShellUserMenu } from './ShellUserMenu';

interface MobileShellDrawerProps {
  activePathname: string;
  navSections: ShellNavSection[];
  onClose: () => void;
  onSignOut?: (() => void) | undefined;
  opened: boolean;
  signingOut?: boolean | undefined;
  title?: string;
  user?: ShellUser | undefined;
}

export function MobileShellDrawer({
  activePathname,
  navSections,
  onClose,
  onSignOut,
  opened,
  signingOut,
  title = 'Navigation',
  user
}: MobileShellDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      position="right"
      size="sm"
      styles={{
        content: { background: '#0e0e0e', color: 'var(--tt-cream)' },
        header: { background: '#0e0e0e', color: 'var(--tt-cream)', borderBottom: '1px solid rgba(184, 147, 62, 0.15)' }
      }}
    >
      <Stack gap="md" pt="sm">
        {navSections.map((section, index) => (
          <Stack key={section.title ?? index} gap={6}>
            {section.title ? (
              <Text size="xs" fw={800} style={{ color: 'var(--tt-gold-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {section.title}
              </Text>
            ) : null}
            {section.items.map((item) => {
              const active = activePathname === item.href || activePathname.startsWith(`${item.href}/`);
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href as never}
                  fullWidth
                  justify="flex-start"
                  variant={active ? 'filled' : 'subtle'}
                  leftSection={IconComponent ? <IconComponent size={17} color={active ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)'} /> : undefined}
                  onClick={onClose}
                  styles={{
                    root: {
                      background: active ? 'rgba(155, 27, 48, 0.3)' : 'rgba(250, 247, 242, 0.03)',
                      border: active ? '1px solid rgba(184,147,62,0.24)' : '1px solid rgba(250,247,242,0.06)',
                      color: active ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        ))}
        <ShellUserMenu
          onSignOut={onSignOut}
          signingOut={signingOut}
          user={user}
        />
      </Stack>
    </Drawer>
  );
}
