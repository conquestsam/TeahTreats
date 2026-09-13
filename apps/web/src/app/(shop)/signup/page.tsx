import type { Metadata } from 'next';
import { AppShell } from '../../../components/layout/app-shell';
import { CustomerSignupContent } from '../../../contents/CustomerAuth/CustomerSignupContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Create Account | TeshTreats',
  description: 'Create a TeshTreats account for faster checkout, order history, and customer rewards.',
  path: '/signup'
});

export default function CustomerSignupPage() {
  return (
    <AppShell>
      <CustomerSignupContent />
    </AppShell>
  );
}
