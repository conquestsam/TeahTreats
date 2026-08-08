'use client';

import { ActionIcon, Avatar, Badge, Burger, Button, Drawer, Group, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { TeahTreatsLogo } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsLogo';

interface AdminShellProps {
  children: React.ReactNode;
  userName?: string | undefined;
  signingOut?: boolean | undefined;
  onSignOut: () => void;
}

interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: (props: { size?: number; color?: string }) => React.JSX.Element;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        hint: 'Live',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'Catalog',
    items: [
      {
        href: '/admin/products',
        label: 'Products',
        hint: 'Items',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        )
      },
      {
        href: '/admin/inventory',
        label: 'Inventory',
        hint: 'Stock',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        )
      },
      {
        href: '/admin/orders',
        label: 'Orders',
        hint: 'Sales',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )
      },
      {
        href: '/admin/payments/manual',
        label: 'Payments',
        hint: 'Billing',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'Marketing',
    items: [
      {
        href: '/admin/promotions',
        label: 'Promotions',
        hint: 'Promos',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
            <path d="M7 7h.01" />
          </svg>
        )
      },
      {
        href: '/admin/users',
        label: 'Users',
        hint: 'Team',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      {
        href: '/admin/tenants',
        label: 'Tenants',
        hint: 'Stores',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M9 8h1" />
            <path d="M9 12h1" />
            <path d="M9 16h1" />
            <path d="M14 8h1" />
            <path d="M14 12h1" />
            <path d="M14 16h1" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          </svg>
        )
      },
      {
        href: '/admin/security',
        label: 'Security',
        hint: 'Logs',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        href: '/admin/notifications',
        label: 'Notifications',
        hint: 'Alerts',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        )
      },
      {
        href: '/admin/reports',
        label: 'Reports',
        hint: 'Stats',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
          </svg>
        )
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        hint: 'Config',
        icon: ({ size = 18, color = 'currentColor' }) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      }
    ]
  }
];

export function AdminShell({ children, userName, signingOut, onSignOut }: AdminShellProps) {
  const pathname = usePathname();
  const [opened, { open, close }] = useDisclosure(false);
  const [collapsed, setCollapsed] = useState(false);

  const initialLetter = (userName ?? 'Admin').charAt(0).toUpperCase();

  const renderNavSection = (section: NavSection, isMobile = false) => (
    <Stack key={section.title} gap={4} mb={isMobile ? 'sm' : 'xs'}>
      {!collapsed || isMobile ? (
        <Text size="xs" fw={700} style={{ color: 'var(--tt-gold-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: 6, fontSize: '0.65rem', marginBottom: 2 }}>
          {section.title}
        </Text>
      ) : null}

      {section.items.map((link) => {
        const active = pathname === link.href;
        const IconComponent = link.icon;

        const linkContent = (
          <Button
            key={link.href}
            component={Link}
            href={link.href as never}
            variant={active ? 'filled' : 'subtle'}
            justify={collapsed && !isMobile ? 'center' : 'flex-start'}
            radius="md"
            size="sm"
            onClick={close}
            styles={{
              root: {
                padding: collapsed && !isMobile ? '6px' : '6px 10px',
                height: 38,
                fontWeight: active ? 700 : 500,
                background: active
                  ? 'linear-gradient(135deg, rgba(184, 147, 62, 0.22), rgba(155, 27, 48, 0.35))'
                  : 'transparent',
                border: active ? '1px solid rgba(184, 147, 62, 0.4)' : '1px solid transparent',
                color: active ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)',
                boxShadow: active ? '0 4px 16px rgba(184, 147, 62, 0.15)' : 'none',
                '&:hover': {
                  background: active
                    ? 'linear-gradient(135deg, rgba(184, 147, 62, 0.3), rgba(155, 27, 48, 0.45))'
                    : 'rgba(184, 147, 62, 0.08)',
                  color: 'var(--tt-cream)'
                }
              },
              inner: { justifyContent: collapsed && !isMobile ? 'center' : 'flex-start', width: '100%' }
            }}
            leftSection={<IconComponent size={17} color={active ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)'} />}
          >
            {!collapsed || isMobile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{link.label}</span>
                <Text size="xs" style={{ color: active ? 'var(--tt-gold-light)' : 'var(--tt-cream-dim)', fontSize: '0.68rem', marginLeft: 6 }}>
                  {link.hint}
                </Text>
              </div>
            ) : null}
          </Button>
        );

        if (collapsed && !isMobile) {
          return (
            <Tooltip key={link.href} label={link.label} position="right" withArrow arrowSize={6}>
              {linkContent}
            </Tooltip>
          );
        }

        return linkContent;
      })}
    </Stack>
  );

  return (
    <div className="admin-shell-grid" style={{ '--admin-sidebar-width': collapsed ? '78px' : '260px' } as React.CSSProperties}>
      <aside className="sticky top-0 hidden h-screen border-r border-[rgba(184,147,62,0.14)] bg-[#0e0e0e] md:flex md:flex-col z-20 overflow-hidden">
        {/* Top Header */}
        <div className="p-3 pb-2 border-b border-[rgba(184,147,62,0.1)] flex-shrink-0">
          <Group justify={collapsed ? 'center' : 'space-between'} align="center">
            <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <TeahTreatsLogo />
            </Link>
            {!collapsed ? (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setCollapsed(true)}
                style={{ color: 'var(--tt-cream-muted)' }}
                title="Collapse sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </ActionIcon>
            ) : (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setCollapsed(false)}
                style={{ color: 'var(--tt-gold-light)' }}
                title="Expand sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </ActionIcon>
            )}
          </Group>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 admin-sidebar-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(184,147,62,0.25) transparent' }}>
          <Stack gap="xs">
            {navSections.map((section) => renderNavSection(section))}
          </Stack>
        </div>

        {/* Fixed User Profile Card */}
        <div className="p-3 border-t border-[rgba(184,147,62,0.12)] bg-[#121212] flex-shrink-0">
          <Stack gap="xs">
            {!collapsed ? (
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar radius="xl" size="sm" style={{ background: 'var(--tt-crimson)', color: '#fff', fontWeight: 700 }}>
                    {initialLetter}
                  </Avatar>
                  <div style={{ minWidth: 0 }}>
                    <Text size="xs" fw={700} truncate style={{ color: 'var(--tt-cream)' }}>
                      {userName ?? 'Admin User'}
                    </Text>
                    <Text size="xs" style={{ color: 'var(--tt-gold-light)', fontSize: '0.68rem' }}>
                      Admin
                    </Text>
                  </div>
                </Group>
                <Badge size="xs" styles={{ root: { background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)', flexShrink: 0 } }}>
                  Active
                </Badge>
              </Group>
            ) : (
              <Tooltip label={userName ?? 'Admin'} position="right">
                <Avatar radius="xl" size="sm" mx="auto" style={{ background: 'var(--tt-crimson)', color: '#fff', fontWeight: 700 }}>
                  {initialLetter}
                </Avatar>
              </Tooltip>
            )}

            <Button
              variant="outline"
              size="xs"
              fullWidth
              loading={Boolean(signingOut)}
              onClick={onSignOut}
              styles={{ root: { borderColor: 'rgba(155, 27, 48, 0.4)', color: '#ef4444', '&:hover': { background: 'rgba(155, 27, 48, 0.15)' } } }}
            >
              {!collapsed ? 'Sign Out' : 'Exit'}
            </Button>
          </Stack>
        </div>
      </aside>

      <section className="admin-main-surface">
        <header className="sticky top-0 z-30 border-b border-[rgba(184,147,62,0.12)] bg-[#111111]/90 backdrop-blur-xl md:hidden">
          <div className="admin-container py-3">
            <Group justify="space-between">
              <TeahTreatsLogo />
              <Burger opened={opened} onClick={open} size="sm" color="var(--tt-cream)" aria-label="Open admin navigation" />
            </Group>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          {children}
        </motion.div>
      </section>

      <Drawer
        opened={opened}
        onClose={close}
        title="Admin Navigation"
        position="right"
        size="sm"
        styles={{
          content: { background: '#0e0e0e', color: 'var(--tt-cream)' },
          header: { background: '#0e0e0e', color: 'var(--tt-cream)', borderBottom: '1px solid rgba(184, 147, 62, 0.15)' }
        }}
      >
        <Stack gap="md" pt="sm">
          {navSections.map((section) => renderNavSection(section, true))}
          <Button
            variant="outline"
            loading={Boolean(signingOut)}
            onClick={onSignOut}
            styles={{ root: { borderColor: 'rgba(155, 27, 48, 0.4)', color: '#ef4444' } }}
          >
            Sign Out
          </Button>
        </Stack>
      </Drawer>
    </div>
  );
}
