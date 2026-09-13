import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { CustomerBundleContent } from '../../../contents/CustomerBundle/CustomerBundleContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Snack Bundles and Party Trays | TeshTreats',
  description: 'Build snack bundles and party trays with puff puff, samosas, spring rolls, meat pies, and zobo.',
  path: '/bundles',
  keywords: ['snack bundles', 'party trays', 'office trays']
});

export default function BundlesPage() {
  return (
    <AppShell>
      <CustomerBundleContent />
    </AppShell>
  );
}
