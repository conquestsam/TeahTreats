export const promotionStatuses = ['draft', 'active', 'archived'] as const;
export const promotionDiscountTypes = ['percentage', 'fixed_amount', 'bundle', 'free_shipping', 'first_order'] as const;
export const promotionTargetTypes = ['all_products', 'products', 'categories', 'brands', 'customers'] as const;

export type PromotionStatusValue = (typeof promotionStatuses)[number];
export type PromotionDiscountTypeValue = (typeof promotionDiscountTypes)[number];
export type PromotionTargetTypeValue = (typeof promotionTargetTypes)[number];

export interface PromotionSummary {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: PromotionStatusValue;
  discountType: PromotionDiscountTypeValue;
  discountValue: number;
  targetType: PromotionTargetTypeValue;
  targetProductIds: string[];
  targetCategories: string[];
  targetBrands: string[];
  targetCustomerIds: string[];
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  minimumOrderAmountCents: number | null;
  stackable: boolean;
  couponCodes: CouponCodeSummary[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CouponCodeSummary {
  id: string;
  code: string;
  active: boolean;
  usageLimit: number | null;
}

export interface CouponValidationSummary {
  valid: boolean;
  code: string;
  message: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  discountLines: Array<{
    code?: string;
    label: string;
    amountCents: number;
  }>;
}
