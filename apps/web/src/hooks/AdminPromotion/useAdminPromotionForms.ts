'use client';

import { useForm } from '@mantine/form';
import { validatePromotionCoupon, validatePromotionDiscount, validatePromotionName } from '@/validation/AdminPromotion/adminPromotionValidation';

export function useAdminPromotionForm() {
  return useForm({
    initialValues: {
      name: '',
      description: '',
      status: 'draft',
      discountType: 'percentage',
      discountValue: 10,
      targetType: 'all_products',
      targetProductIds: '',
      targetCategories: '',
      targetBrands: '',
      targetCustomerIds: '',
      startsAt: '',
      endsAt: '',
      usageLimit: '',
      perCustomerLimit: '',
      minimumOrderAmount: '',
      stackable: false,
      couponCode: '',
      couponUsageLimit: ''
    },
    validate: {
      name: validatePromotionName,
      discountValue: (value, values) => validatePromotionDiscount(Number(value), values.discountType),
      couponCode: validatePromotionCoupon
    }
  });
}
