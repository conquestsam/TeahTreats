import { VendorDashboardGate } from '../../../../components/VendorDashboard/VendorDashboardGate';
import { VendorInventoryContent } from '../../../../contents/VendorInventory/VendorInventoryContent';

export default function VendorInventoryPage() {
  return (
    <VendorDashboardGate>
      <VendorInventoryContent />
    </VendorDashboardGate>
  );
}
