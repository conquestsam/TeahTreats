import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminUserContent } from '../../../../contents/AdminUser/AdminUserContent';

export default function AdminUsersPage() {
  return (
    <AdminAuthGate>
      <AdminUserContent />
    </AdminAuthGate>
  );
}
