import { AdminAuthGate } from '@/components/AdminAuth/AdminAuthGate';
import { AdminNotificationContent } from '../../../../contents/AdminNotification/AdminNotificationContent';

export default function AdminNotificationsPage() {
  return (
    <AdminAuthGate>
      <AdminNotificationContent />
    </AdminAuthGate>
  );
}
