import { AppShell } from '../../../components/layout/app-shell';
import { LegalPageContent } from '../../../contents/functional-contents/Legal/LegalPageContent';

export default function PrivacyPage() {
  return (
    <AppShell>
      <LegalPageContent
        title="Privacy Policy"
        updatedAt="August 5, 2026"
        intro="We collect only the information needed to run snack ordering, payment review, support, and account access."
        sections={[
          {
            heading: 'Information we collect',
            body: ['Name, email, phone, address, order details, payment status, support messages, and device/session signals.']
          },
          {
            heading: 'How we use it',
            body: [
              'To process orders, prevent fraud, send order updates, support customer accounts, and improve product availability.',
              'Payment card details are handled by payment providers. We do not store full card numbers.'
            ]
          },
          {
            heading: 'Sharing',
            body: [
              'We share data with service providers such as payment processors, email/SMS providers, hosting, storage, and analytics tools only as needed.',
              'We do not sell customer personal information.'
            ]
          },
          {
            heading: 'Retention',
            body: ['Order, payment, and audit records are retained as needed for business, tax, fraud, and legal reasons.']
          }
        ]}
      />
    </AppShell>
  );
}
