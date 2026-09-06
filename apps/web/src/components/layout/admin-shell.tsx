'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { permissions, type AdminAuthUser, type Permission } from '@snacks/shared';

import { useUiShellStore } from '@/lib/store/ui-shell-store';
import { AppHeader } from './AppHeader';
import { AppBottomNav } from './AppBottomNav';
import { AppSidebar } from './AppSidebar';
import { MobileShellDrawer } from './MobileShellDrawer';
import type { ShellNavSection } from './shell-types';

interface AdminShellProps {
  children: React.ReactNode;
  user?: AdminAuthUser | undefined;
  signingOut?: boolean | undefined;
  onSignOut: () => void;
}

function ShellIcon({
  children,
  color = 'currentColor',
  size = 18
}: {
  children: React.ReactNode;
  color?: string | undefined;
  size?: number | undefined;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const navSections: ShellNavSection[] = [
  {
    title: 'Operations',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        requiredPermissions: [permissions.dashboardRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/orders',
        label: 'Orders',
        requiredPermissions: [permissions.ordersRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
          </ShellIcon>
        )
      }
    ]
  },
  {
    title: 'Commerce',
    items: [
      {
        href: '/admin/products',
        label: 'Product Catalog',
        requiredPermissions: [permissions.productsRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M4 19h16" />
            <path d="M5 5h14" />
            <path d="M7 5v14" />
            <path d="M17 5v14" />
            <path d="M9 9h6" />
            <path d="M9 13h6" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/promotions',
        label: 'Promotions',
        requiredPermissions: [permissions.promotionsRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
          </ShellIcon>
        )
      }
    ]
  },
  {
    title: 'Inventory',
    items: [
      {
        href: '/admin/inventory',
        label: 'Inventory',
        requiredPermissions: [permissions.inventoryRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-8h6v8" />
          </ShellIcon>
        )
      }
    ]
  },
  {
    title: 'Finance & Audit',
    items: [
      {
        href: '/admin/payments/manual',
        label: 'Manual Payments',
        requiredPermissions: [permissions.manualPaymentsReview],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/reports',
        label: 'Reports & Insights',
        requiredPermissions: [permissions.reportsRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
          </ShellIcon>
        )
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        href: '/admin/tenants',
        label: 'Stores',
        requiredPermissions: [permissions.tenantsManage],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M3 21h18" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <path d="M9 8h1" />
            <path d="M14 8h1" />
            <path d="M9 13h1" />
            <path d="M14 13h1" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/users',
        label: 'Users & Roles',
        requiredPermissions: [permissions.usersManage],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/notifications',
        label: 'Notifications',
        requiredPermissions: [permissions.notificationsRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/security',
        label: 'Security',
        requiredPermissions: [permissions.auditRead],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </ShellIcon>
        )
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        requiredPermissions: [permissions.tenantsManage],
        icon: ({ size, color }) => (
          <ShellIcon size={size} color={color}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3" />
            <path d="M12 19v3" />
            <path d="m4.93 4.93 2.12 2.12" />
            <path d="m16.95 16.95 2.12 2.12" />
            <path d="M2 12h3" />
            <path d="M19 12h3" />
            <path d="m4.93 19.07 2.12-2.12" />
            <path d="m16.95 7.05 2.12-2.12" />
          </ShellIcon>
        )
      }
    ]
  }
];

function hasRequiredPermission(userPermissions: Permission[], requiredPermissions?: Permission[]) {
  if (!requiredPermissions?.length) {
    return true;
  }

  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

function visibleNavSections(userPermissions: Permission[]) {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasRequiredPermission(userPermissions, item.requiredPermissions))
    }))
    .filter((section) => section.items.length > 0);
}

function roleLabelFor(user: AdminAuthUser | undefined) {
  if (!user) {
    return 'Operations';
  }

  if (user.permissions.includes(permissions.tenantsManage)) {
    return 'Super Admin';
  }

  if (user.permissions.includes(permissions.ordersWrite)) {
    return 'Operations Lead';
  }

  if (user.permissions.includes(permissions.productsWrite)) {
    return 'Catalog Manager';
  }

  return 'Team Member';
}

function badgeFor(name: string | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  return (parts[0]?.slice(0, 2) || 'TT').toUpperCase();
}

export function AdminShell({ children, user, signingOut, onSignOut }: AdminShellProps) {
  const pathname = usePathname();
  const collapsed = useUiShellStore((state) => state.adminSidebarCollapsed);
  const mobileNavOpen = useUiShellStore((state) => state.mobileNavOpen);
  const openMobileNav = useUiShellStore((state) => state.openMobileNav);
  const closeMobileNav = useUiShellStore((state) => state.closeMobileNav);
  const setAdminSidebarCollapsed = useUiShellStore((state) => state.setAdminSidebarCollapsed);
  const userPermissions = (user?.permissions ?? []) as Permission[];
  const shellNavSections = visibleNavSections(userPermissions);
  const bottomNavSections = visibleAdminBottomNavSections(userPermissions);
  const shellUser = {
    name: user?.name ?? 'Admin User',
    role: roleLabelFor(user),
    badge: badgeFor(user?.name)
  };
  const canViewAllTenants = userPermissions.includes(permissions.tenantsManage);

  return (
    <div className="min-h-screen bg-[#080808] text-[var(--tt-cream)]" data-no-lenis>
      <AppHeader
        mobileMenuOpen={mobileNavOpen}
        onMobileMenuToggle={openMobileNav}
        showMobileMenu
        statusLabel="Production"
        storeLabel={canViewAllTenants ? 'All Stores' : `${user?.tenantIds.length ?? 0} Assigned Store${user?.tenantIds.length === 1 ? '' : 's'}`}
        storeSubLabel={canViewAllTenants ? 'Company-wide view' : 'Store access'}
        user={shellUser}
        variant="admin"
      />
      <div
        className="admin-shell-grid"
        style={{ '--admin-sidebar-width': collapsed ? '78px' : '260px' } as React.CSSProperties}
      >
        <AppSidebar
          activePathname={pathname}
          collapsed={collapsed}
          navSections={shellNavSections}
          onCollapseChange={setAdminSidebarCollapsed}
          onNavigate={closeMobileNav}
          onSignOut={onSignOut}
          signingOut={signingOut}
          user={shellUser}
        />

        <section className="admin-main-surface">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            {children}
          </motion.div>
        </section>
      </div>

      <AppBottomNav
        activePathname={pathname}
        navSections={bottomNavSections}
        maxItems={5}
        onNavigate={closeMobileNav}
      />

      <MobileShellDrawer
        opened={mobileNavOpen}
        onClose={closeMobileNav}
        title="Admin Navigation"
        activePathname={pathname}
        navSections={shellNavSections}
        onSignOut={onSignOut}
        signingOut={signingOut}
        user={shellUser}
      />
    </div>
  );
}

function visibleAdminBottomNavSections(userPermissions: Permission[]): ShellNavSection[] {
  const items = [
    findNavItem('/admin/orders', 'Orders'),
    findNavItem('/admin/promotions', 'Promos'),
    findNavItem('/admin/payments/manual', 'Payments'),
    findNavItem('/admin/reports', 'Reports'),
    findNavItem('/admin/settings', 'Settings')
  ].filter((item): item is ShellNavSection['items'][number] => Boolean(item))
    .filter((item) => hasRequiredPermission(userPermissions, item.requiredPermissions));

  return items.length > 0 ? [{ items }] : [];
}

function findNavItem(href: string, label: string) {
  const item = navSections.flatMap((section) => section.items).find((navItem) => navItem.href === href);

  return item ? { ...item, label } : null;
}
