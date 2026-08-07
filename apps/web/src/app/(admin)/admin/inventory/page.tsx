import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminInventoryContent } from '../../../../contents/functional-contents/AdminInventory/AdminInventoryContent';

export default function AdminInventoryPage() {
  return (
    <AdminAuthGate>
      <AdminInventoryContent />
    </AdminAuthGate>
  );
}
