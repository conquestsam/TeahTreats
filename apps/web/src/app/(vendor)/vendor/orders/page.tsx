import { VendorDashboardGate } from '../../../../components/functional-components/VendorDashboard/VendorDashboardGate';
import { VendorOrderContent } from '../../../../contents/functional-contents/VendorOrder/VendorOrderContent';

export default function VendorOrdersPage() {
  return (
    <VendorDashboardGate>
      <VendorOrderContent />
    </VendorDashboardGate>
  );
}
