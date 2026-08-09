'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const DISABLED_PATH_PREFIXES = [
  '/admin',
  '/vendor',
  '/cart',
  '/checkout',
  '/account',
  '/payment',
  '/login',
  '/signup'
];

export function LenisProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  useEffect(() => {
    const disabledByRoute = DISABLED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (disabledByRoute || reducedMotion) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      prevent: (node) => {
        return Boolean(
          node.closest(
            [
              '[data-no-lenis]',
              '.mantine-Modal-root',
              '.mantine-Modal-content',
              '.mantine-Modal-body',
              '.mantine-Drawer-root',
              '.mantine-Drawer-content',
              '.mantine-Drawer-body',
              '.mantine-Popover-dropdown',
              '.mantine-Select-dropdown',
              '.mantine-MultiSelect-dropdown',
              '.mantine-ScrollArea-root',
              '.admin-shell-grid',
              '.admin-sidebar-scroll',
              'form',
              'table'
            ].join(',')
          )
        );
      }
    });

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return children;
}
