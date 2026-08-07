import { Suspense } from 'react';
import { AppShell } from '../../../components/layout/app-shell';
import { StorefrontProductsContent } from '../../../contents/functional-contents/Storefront/StorefrontProductsContent';

export default function ProductsPage() {
  return (
    <AppShell>
      <Suspense>
        <StorefrontProductsContent />
      </Suspense>
    </AppShell>
  );
}
