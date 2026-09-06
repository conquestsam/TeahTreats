import { Suspense } from 'react';
import { AppShell } from '../../../components/layout/app-shell';
import { CustomerPaymentContent } from '../../../contents/CustomerPayment/CustomerPaymentContent';

export default function PaymentPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <CustomerPaymentContent />
      </Suspense>
    </AppShell>
  );
}
