'use client';

import { ActionIcon, Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import Link from 'next/link';

import type { ShellNavSection, ShellUser } from './shell-types';
import { ShellUserMenu } from './ShellUserMenu';

interface AppSidebarProps {
  activePathname: string;
  collapsed?: boolean;
  navSections: ShellNavSection[];
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
  onNavigate?: (() => void) | undefined;
  onSignOut?: (() => void) | undefined;
  signingOut?: boolean | undefined;
  user?: ShellUser | undefined;
}

export function AppSidebar({
  activePathname,
  collapsed = false,
  navSections,
  onCollapseChange,
  onNavigate,
  onSignOut,
  signingOut,
  user
}: AppSidebarProps) {
  const renderLink = (item: ShellNavSection['items'][number]) => {
    const active = activePathname === item.href || activePathname.startsWith(`${item.href}/`);
    const IconComponent = item.icon;
    const linkContent = (
      <Button
        key={item.href}
        component={Link}
        href={item.href as never}
        variant={active ? 'filled' : 'subtle'}
        justify={collapsed ? 'center' : 'flex-start'}
        radius="md"
        size="sm"
        disabled={Boolean(item.disabled)}
        onClick={() => onNavigate?.()}
        styles={{
          root: {
            padding: collapsed ? '6px' : '6px 10px',
            height: 38,
            fontWeight: active ? 750 : 550,
            background: active
              ? 'linear-gradient(135deg, rgba(184, 147, 62, 0.22), rgba(155, 27, 48, 0.35))'
              : 'transparent',
            border: active ? '1px solid rgba(184, 147, 62, 0.4)' : '1px solid transparent',
            color: active ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)',
            boxShadow: active ? '0 4px 16px rgba(184, 147, 62, 0.15)' : 'none'
          },
          inner: { justifyContent: collapsed ? 'center' : 'flex-start', width: '100%' }
        }}
        leftSection={IconComponent ? <IconComponent size={17} color={active ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)'} /> : undefined}
      >
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{item.label}</span>
            {item.hint ? (
              <Text size="xs" style={{ color: active ? 'var(--tt-gold-light)' : 'var(--tt-cream-dim)', fontSize: '0.68rem', marginLeft: 6 }}>
                {item.hint}
              </Text>
            ) : null}
          </div>
        ) : null}
      </Button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href} label={item.label} position="right" withArrow arrowSize={6}>
          {linkContent}
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside className="hidden min-h-[calc(100dvh-61px)] border-r border-[rgba(255,255,255,0.08)] bg-[#090909] md:flex md:flex-col z-20 overflow-hidden">
      <div className="p-3 pb-2 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
        <Group justify={collapsed ? 'center' : 'flex-end'} align="center">
          {onCollapseChange ? (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onCollapseChange(!collapsed)}
              style={{ color: collapsed ? 'var(--tt-gold-light)' : 'var(--tt-cream-dim)' }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
              </svg>
            </ActionIcon>
          ) : null}
        </Group>
      </div>

      <div className="flex-1 overflow-y-auto p-3 admin-sidebar-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(184,147,62,0.25) transparent' }}>
        <Stack gap="xs">
          {navSections.map((section, index) => (
            <Stack key={section.title ?? index} gap={4} mb="xs">
              {section.title && !collapsed ? (
                <Text size="xs" fw={700} style={{ color: 'var(--tt-gold-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: 6, fontSize: '0.65rem', marginBottom: 2 }}>
                  {section.title}
                </Text>
              ) : null}
              {section.items.map(renderLink)}
            </Stack>
          ))}
        </Stack>
      </div>

      <div className="p-3 border-t border-[rgba(184,147,62,0.12)] bg-[#121212] flex-shrink-0">
        <ShellUserMenu
          collapsed={collapsed}
          onSignOut={onSignOut}
          signingOut={signingOut}
          user={user}
        />
      </div>
    </aside>
  );
}
