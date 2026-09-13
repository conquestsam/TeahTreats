import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { OfficeSnackPlannerContent } from '../../../contents/OfficeSnackPlanner/OfficeSnackPlannerContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Office Snack Planner | TeshTreats',
  description: 'Plan office snack trays by headcount, budget, dietary notes, and pickup or delivery timing.',
  path: '/office-snack-planner',
  keywords: ['office snacks', 'meeting snacks', 'corporate snack trays']
});

export default function OfficeSnackPlannerPage() {
  return (
    <AppShell>
      <OfficeSnackPlannerContent />
    </AppShell>
  );
}
