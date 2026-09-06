import { Suspense } from 'react';
import { AppShell } from '../../../components/layout/app-shell';
import { StorefrontSearchContent } from '../../../contents/Storefront/StorefrontSearchContent';

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense>
        <StorefrontSearchContent />
      </Suspense>
    </AppShell>
  );
}
