import type { Metadata } from 'next';
import { privatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privatePageMetadata(
  'Admin Console',
  'Protected TeshTreats admin tools for orders, products, inventory, payments, notifications, reports, settings, and users.',
);

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
