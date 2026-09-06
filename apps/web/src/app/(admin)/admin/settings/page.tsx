import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminSettingsContent } from '../../../../contents/AdminSettings/AdminSettingsContent';

export default function AdminSettingsPage() {
  return (
    <AdminAuthGate>
      <AdminSettingsContent />
    </AdminAuthGate>
  );
}
