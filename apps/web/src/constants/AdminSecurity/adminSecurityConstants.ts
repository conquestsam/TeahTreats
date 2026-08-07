export const adminAuditLogQueryKey = ['admin-security', 'audit-logs'] as const;

export const adminAuditKindOptions = [
  { value: 'all', label: 'All' },
  { value: 'auth', label: 'Auth' },
  { value: 'payment', label: 'Payment' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'settings', label: 'Settings' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'iam', label: 'Access' }
] as const;
