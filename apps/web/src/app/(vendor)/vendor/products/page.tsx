import { VendorDashboardGate } from '../../../../components/VendorDashboard/VendorDashboardGate';
import { VendorProductContent } from '../../../../contents/VendorProduct/VendorProductContent';

export default function VendorProductsPage() {
  return (
    <VendorDashboardGate>
      <VendorProductContent />
    </VendorDashboardGate>
  );
}
