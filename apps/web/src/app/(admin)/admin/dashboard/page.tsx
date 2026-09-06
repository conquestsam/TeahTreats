import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminDashboardContent } from '../../../../contents/AdminDashboard/AdminDashboardContent';

export default function AdminDashboardPage() {
  return (
    <AdminAuthGate>
      <AdminDashboardContent />
    </AdminAuthGate>
  );
}
