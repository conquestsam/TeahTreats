import type {
  CouponValidationSummary,
  PromotionDiscountTypeValue,
  PromotionStatusValue,
  PromotionSummary,
  PromotionTargetTypeValue
} from '@snacks/shared';

export type AdminPromotionModel = PromotionSummary;
export type CouponPreviewModel = CouponValidationSummary;

export interface AdminPromotionInput {
  name: string;
  description?: string;
  status?: PromotionStatusValue;
  discountType: PromotionDiscountTypeValue;
  discountValue: number;
  targetType?: PromotionTargetTypeValue;
  targetProductIds?: string[];
  targetCategories?: string[];
  targetBrands?: string[];
  targetCustomerIds?: string[];
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  minimumOrderAmountCents?: number;
  stackable?: boolean;
  couponCodes?: Array<{
    code: string;
    active?: boolean;
    usageLimit?: number;
  }>;
}
