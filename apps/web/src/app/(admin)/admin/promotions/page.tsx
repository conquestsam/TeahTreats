import { AdminAuthGate } from '../../../../components/functional-components/AdminAuth/AdminAuthGate';
import { AdminPromotionContent } from '../../../../contents/functional-contents/AdminPromotion/AdminPromotionContent';

export default function AdminPromotionsPage() {
  return (
    <AdminAuthGate>
      <AdminPromotionContent />
    </AdminAuthGate>
  );
}
