import { AppShell } from '../../../components/layout/app-shell';
import { LegalPageContent } from '../../../contents/functional-contents/Legal/LegalPageContent';

export default function TermsPage() {
  return (
    <AppShell>
      <LegalPageContent
        title="Terms"
        updatedAt="August 5, 2026"
        intro="These terms explain the basic rules for using this snacks ordering service."
        sections={[
          {
            heading: 'Orders',
            body: [
              'Product availability, prices, and quantities are confirmed by the backend at checkout.',
              'An order is not ready until the store marks it ready and sends a readiness notice.'
            ]
          },
          {
            heading: 'Accounts',
            body: ['You are responsible for keeping your account and contact information accurate and secure.']
          },
          {
            heading: 'Payments',
            body: [
              'Card and PayPal payments are confirmed by the payment provider.',
              'Manual payment receipts may require admin review before an order is prepared.'
            ]
          },
          {
            heading: 'Service limits',
            body: ['We may refuse, cancel, or refund orders when stock, payment, safety, or abuse concerns require it.']
          }
        ]}
      />
    </AppShell>
  );
}
