import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppShell } from '../../../components/layout/app-shell';
import { StorefrontProductsContent } from '../../../contents/Storefront/StorefrontProductsContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'TeshTreats Menu | Snacks, Cakes, Zobo, and Party Trays',
  description: 'Browse TeshTreats snacks, cakes, drinks, and party trays with current availability and prices.',
  path: '/products',
  keywords: ['snack menu', 'party snacks', 'cakes menu']
});

export default function ProductsPage() {
  return (
    <AppShell>
      <Suspense>
        <StorefrontProductsContent />
      </Suspense>
    </AppShell>
  );
}
