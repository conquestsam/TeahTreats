import { AdminAuthGate } from '@/components/functional-components/AdminAuth/AdminAuthGate';
import { AdminNotificationContent } from '../../../../contents/functional-contents/AdminNotification/AdminNotificationContent';

export default function AdminNotificationsPage() {
  return (
    <AdminAuthGate>
      <AdminNotificationContent />
    </AdminAuthGate>
  )
  
}
