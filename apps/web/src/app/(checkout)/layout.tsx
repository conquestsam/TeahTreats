import type { Metadata } from 'next';
import { privatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privatePageMetadata(
  'Checkout',
  'Private TeshTreats checkout pages for cart review, payment, and order completion.',
);

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
