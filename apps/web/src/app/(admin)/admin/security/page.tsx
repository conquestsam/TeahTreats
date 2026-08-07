import { AdminAuthGate } from '@/components/functional-components/AdminAuth/AdminAuthGate';
import { AdminSecurityContent } from '../../../../contents/functional-contents/AdminSecurity/AdminSecurityContent';

export default function AdminSecurityPage() {
  return (
  <AdminAuthGate>
    <AdminSecurityContent />
  </AdminAuthGate>
  )
}
