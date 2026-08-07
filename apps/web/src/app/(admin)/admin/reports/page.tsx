import { AdminAuthGate } from '@/components/functional-components/AdminAuth/AdminAuthGate';
import { AdminReportContent } from '../../../../contents/functional-contents/AdminReport/AdminReportContent';

export default function AdminReportsPage() {
  return (
  
    <AdminAuthGate>
      <AdminReportContent />
    </AdminAuthGate>
  );
}
