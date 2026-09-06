'use client';

import Link from 'next/link';
import type { ShellNavSection } from './shell-types';

interface AppBottomNavProps {
  activePathname: string;
  navSections: ShellNavSection[];
  maxItems?: number;
  onNavigate?: () => void;
}

export function AppBottomNav({
  activePathname,
  navSections,
  maxItems = 4,
  onNavigate
}: AppBottomNavProps) {
  const items = navSections.flatMap((section) => section.items).slice(0, maxItems);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className="app-bottom-nav md:hidden"
      aria-label="Primary navigation"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const active = activePathname === item.href || activePathname.startsWith(`${item.href}/`);
        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href as never}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            className={active ? 'app-bottom-nav-link app-bottom-nav-link-active' : 'app-bottom-nav-link'}
          >
            <span className="app-bottom-nav-icon">
              {IconComponent ? <IconComponent size={18} color="currentColor" /> : null}
              {item.hint ? <span className="app-bottom-nav-count">{item.hint}</span> : null}
            </span>
            <span className="app-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
