import { AppShell } from '../../../components/layout/app-shell';
import { LegalPageContent } from '../../../contents/functional-contents/Legal/LegalPageContent';

export default function RefundPolicyPage() {
  return (
    <AppShell>
      <LegalPageContent
        title="Refund Policy"
        updatedAt="August 5, 2026"
        intro="Snack orders can involve fresh or perishable items, so refund decisions depend on timing, readiness, and item condition."
        sections={[
          {
            heading: 'Before preparation',
            body: ['Orders may usually be cancelled or refunded before preparation starts, subject to payment provider timing.']
          },
          {
            heading: 'After readiness',
            body: [
              'Fresh, perishable, or prepared snacks may not be refundable after the order is marked ready unless the store made an error.',
              'If an item is missing, incorrect, spoiled, or unsafe, contact support as soon as possible with the order number.'
            ]
          },
          {
            heading: 'Manual payments',
            body: ['Manual payment refunds may require admin reconciliation before money is returned.']
          },
          {
            heading: 'Provider timing',
            body: ['Approved refunds can take several business days depending on Stripe, PayPal, Cash App, Venmo, Zelle, or your bank.']
          }
        ]}
      />
    </AppShell>
  );
}
