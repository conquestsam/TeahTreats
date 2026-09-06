import { AdminAuthGate } from '../../../../../components/AdminAuth/AdminAuthGate';
import { AdminManualPaymentContent } from '../../../../../contents/AdminPayment/AdminManualPaymentContent';

export default function AdminManualPaymentsPage() {
  return (
    <AdminAuthGate>
      <AdminManualPaymentContent />
    </AdminAuthGate>
  );
}
