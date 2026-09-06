import { AdminAuthGate } from '@/components/AdminAuth/AdminAuthGate';
import { AdminSecurityContent } from '../../../../contents/AdminSecurity/AdminSecurityContent';

export default function AdminSecurityPage() {
  return (
    <AdminAuthGate>
      <AdminSecurityContent />
    </AdminAuthGate>
  );
}
