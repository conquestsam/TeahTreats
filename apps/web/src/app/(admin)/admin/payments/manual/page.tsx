import { AdminAuthGate } from '../../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminManualPaymentContent } from '../../../../../contents/functional-contents/AdminPayment/AdminManualPaymentContent';

export default function AdminManualPaymentsPage() {
  return (
    <AdminAuthGate>
      <AdminManualPaymentContent />
    </AdminAuthGate>
  );
}
