import type { Metadata } from 'next';
import { privatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privatePageMetadata(
  'Vendor Console',
  'Protected TeshTreats vendor tools for products, inventory, orders, and dashboard reporting.',
);

export default function VendorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
