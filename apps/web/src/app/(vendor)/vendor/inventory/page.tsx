import { VendorDashboardGate } from '../../../../components/functional-components/VendorDashboard/VendorDashboardGate';
import { VendorInventoryContent } from '../../../../contents/functional-contents/VendorInventory/VendorInventoryContent';

export default function VendorInventoryPage() {
  return (
    <VendorDashboardGate>
      <VendorInventoryContent />
    </VendorDashboardGate>
  );
}
