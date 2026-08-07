export function validatePromotionName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 120) return 'Name must be shorter.';
  return null;
}

export function validatePromotionDiscount(value: number, discountType: string) {
  if (discountType === 'free_shipping') return null;
  if (discountType === 'percentage' || discountType === 'first_order') {
    return value >= 1 && value <= 100 ? null : 'Use a percent from 1 to 100.';
  }
  return value > 0 ? null : 'Amount must be greater than zero.';
}

export function validatePromotionCoupon(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(trimmed.toUpperCase())
    ? null
    : 'Use letters, numbers, dash, or underscore.';
}
