import { VendorDashboardGate } from '../../../../components/functional-components/VendorDashboard/VendorDashboardGate';
import { VendorDashboardContent } from '../../../../contents/functional-contents/VendorDashboard/VendorDashboardContent';

export default function VendorDashboardPage() {
  return (
    <VendorDashboardGate>
      <VendorDashboardContent />
    </VendorDashboardGate>
  );
}
