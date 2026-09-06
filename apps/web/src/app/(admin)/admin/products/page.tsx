import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminProductContent } from '../../../../contents/AdminProduct/AdminProductContent';

export default function AdminProductsPage() {
  return (
    <AdminAuthGate>
      <AdminProductContent />
    </AdminAuthGate>
  );
}
