import { AdminAuthGate } from '@/components/AdminAuth/AdminAuthGate';
import { AdminReportContent } from '../../../../contents/AdminReport/AdminReportContent';

export default function AdminReportsPage() {
  return (
  
    <AdminAuthGate>
      <AdminReportContent />
    </AdminAuthGate>
  );
}
