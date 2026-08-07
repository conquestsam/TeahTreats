import { AdminAuthGate } from '@/components/functional-components/AdminAuth/AdminAuthGate';
import { AdminTenantContent } from '@/contents/functional-contents/AdminTenant/AdminTenantContent';

export default function AdminTenantsPage() {
  return (
    <AdminAuthGate>
      <AdminTenantContent />
    </AdminAuthGate>
  );
}
