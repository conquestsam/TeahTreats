export const adminPromotionQueryKey = ['admin-promotions'] as const;

export const promotionStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
];

export const promotionDiscountTypeOptions = [
  { value: 'percentage', label: 'Percent Off' },
  { value: 'fixed_amount', label: 'Amount Off' },
  { value: 'bundle', label: 'Bundle Discount' },
  { value: 'free_shipping', label: 'Free Shipping Placeholder' },
  { value: 'first_order', label: 'First Order' }
];

export const promotionTargetTypeOptions = [
  { value: 'all_products', label: 'All Snacks' },
  { value: 'products', label: 'Products' },
  { value: 'categories', label: 'Categories' },
  { value: 'brands', label: 'Brands' },
  { value: 'customers', label: 'Customers' }
];
