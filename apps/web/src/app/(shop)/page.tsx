import type { Metadata } from 'next';
import { AppShell } from '../../components/layout/app-shell';
import { StorefrontHomeContent } from '../../contents/Storefront/StorefrontHomeContent';
import { createPageMetadata } from '../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'TeshTreats | African Snacks, Custom Cakes, and Signature Zobo',
  description: 'Order puff puff, meat pies, samosas, spring rolls, custom cakes, and TeshTreats Signature Zobo with visible prices and readiness updates.',
  path: '/'
});

export default function ShopHomePage() {
  return (
    <AppShell>
      <StorefrontHomeContent />
    </AppShell>
  );
}
