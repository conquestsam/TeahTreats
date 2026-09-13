import type { Metadata } from 'next';
import { AppShell } from '../../../components/layout/app-shell';
import { CustomerLoginContent } from '../../../contents/CustomerAuth/CustomerLoginContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Sign In | TeshTreats',
  description: 'Sign in to track TeshTreats orders, saved account details, rewards, and readiness updates.',
  path: '/login'
});

export default function CustomerLoginPage() {
  return (
    <AppShell>
      <CustomerLoginContent />
    </AppShell>
  );
}
