import { VendorDashboardGate } from '../../../../components/functional-components/VendorDashboard/VendorDashboardGate';
import { VendorProductContent } from '../../../../contents/functional-contents/VendorProduct/VendorProductContent';

export default function VendorProductsPage() {
  return (
    <VendorDashboardGate>
      <VendorProductContent />
    </VendorDashboardGate>
  );
}
