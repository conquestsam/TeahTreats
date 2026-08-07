import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminOrderContent } from '../../../../contents/functional-contents/AdminOrder/AdminOrderContent';

export default function AdminOrdersPage() {
  return (
    <AdminAuthGate>
      <AdminOrderContent />
    </AdminAuthGate>
  );
}
