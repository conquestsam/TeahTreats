import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminOrderContent } from '../../../../contents/AdminOrder/AdminOrderContent';

export default function AdminOrdersPage() {
  return (
    <AdminAuthGate>
      <AdminOrderContent />
    </AdminAuthGate>
  );
}
