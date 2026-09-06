export const adminProductQueryKey = ['admin-products'] as const;

export const adminProductStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Live' },
  { value: 'archived', label: 'Archived' }
] as const;
