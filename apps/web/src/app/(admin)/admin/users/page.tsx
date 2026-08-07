import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminUserContent } from '../../../../contents/functional-contents/AdminUser/AdminUserContent';

export default function AdminUsersPage() {
  return (
    <AdminAuthGate>
      <AdminUserContent />
    </AdminAuthGate>
  );
}
