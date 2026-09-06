import type { ReactNode } from 'react';
import type { Permission } from '@snacks/shared';

export interface ShellNavItem {
  href: string;
  label: string;
  hint?: string;
  icon?: (props: { size?: number; color?: string }) => ReactNode;
  disabled?: boolean;
  requiredPermissions?: Permission[];
}

export interface ShellNavSection {
  title?: string;
  items: ShellNavItem[];
}

export interface ShellUser {
  name?: string;
  role?: string;
  badge?: string;
}

export type ShellVariant = 'admin' | 'customer' | 'vendor';
