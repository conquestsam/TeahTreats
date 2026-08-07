import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { OperationsCenter } from '../../../../contents/admin/operations-center';

export default function AdminDashboardPage() {
  return (
    <AdminAuthGate>
      <OperationsCenter />
    </AdminAuthGate>
  );
}
