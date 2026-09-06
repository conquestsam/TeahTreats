import { VendorDashboardGate } from '../../../../components/VendorDashboard/VendorDashboardGate';
import { VendorDashboardContent } from '../../../../contents/VendorDashboard/VendorDashboardContent';

export default function VendorDashboardPage() {
  return (
    <VendorDashboardGate>
      <VendorDashboardContent />
    </VendorDashboardGate>
  );
}
