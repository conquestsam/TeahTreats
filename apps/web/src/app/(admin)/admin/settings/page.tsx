import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminSettingsContent } from '../../../../contents/functional-contents/AdminSettings/AdminSettingsContent';

export default function AdminSettingsPage() {
  return (
    <AdminAuthGate>
      <AdminSettingsContent />
    </AdminAuthGate>
  );
}
