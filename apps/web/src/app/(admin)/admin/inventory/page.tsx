import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminInventoryContent } from '../../../../contents/AdminInventory/AdminInventoryContent';

export default function AdminInventoryPage() {
  return (
    <AdminAuthGate>
      <AdminInventoryContent />
    </AdminAuthGate>
  );
}
