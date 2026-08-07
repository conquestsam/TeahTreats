import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminProductContent } from '../../../../contents/functional-contents/AdminProduct/AdminProductContent';

export default function AdminProductsPage() {
  return (
    <AdminAuthGate>
      <AdminProductContent />
    </AdminAuthGate>
  );
}
