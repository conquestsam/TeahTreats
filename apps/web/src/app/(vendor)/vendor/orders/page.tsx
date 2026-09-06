import { VendorDashboardGate } from '../../../../components/VendorDashboard/VendorDashboardGate';
import { VendorOrderContent } from '../../../../contents/VendorOrder/VendorOrderContent';

export default function VendorOrdersPage() {
  return (
    <VendorDashboardGate>
      <VendorOrderContent />
    </VendorDashboardGate>
  );
}
