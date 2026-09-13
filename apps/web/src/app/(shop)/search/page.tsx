import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppShell } from '../../../components/layout/app-shell';
import { StorefrontSearchContent } from '../../../contents/Storefront/StorefrontSearchContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Search TeshTreats Snacks and Cakes',
  description: 'Search TeshTreats products by snack type, flavor, occasion, and category.',
  path: '/search'
});

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense>
        <StorefrontSearchContent />
      </Suspense>
    </AppShell>
  );
}
