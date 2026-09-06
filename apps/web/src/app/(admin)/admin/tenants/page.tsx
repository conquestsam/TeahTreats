import { AdminAuthGate } from '@/components/AdminAuth/AdminAuthGate';
import { AdminTenantContent } from '@/contents/AdminTenant/AdminTenantContent';

export default function AdminTenantsPage() {
  return (
    <AdminAuthGate>
      <AdminTenantContent />
    </AdminAuthGate>
  );
}
