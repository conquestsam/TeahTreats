import type { Metadata } from 'next';
import { privatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privatePageMetadata(
  'Customer Account',
  'Private TeshTreats customer account pages for order history, loyalty rewards, and saved profile details.',
);

export default function CustomerAccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
