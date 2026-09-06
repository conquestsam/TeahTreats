import { AdminAuthGate } from '../../../../components/AdminAuth/AdminAuthGate';
import { AdminPromotionContent } from '../../../../contents/AdminPromotion/AdminPromotionContent';

export default function AdminPromotionsPage() {
  return (
    <AdminAuthGate>
      <AdminPromotionContent />
    </AdminAuthGate>
  );
}
