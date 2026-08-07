export const permissions = {
  productsRead: 'products:read',
  productsWrite: 'products:write',
  inventoryRead: 'inventory:read',
  inventoryWrite: 'inventory:write',
  ordersRead: 'orders:read',
  ordersWrite: 'orders:write',
  promotionsRead: 'promotions:read',
  promotionsWrite: 'promotions:write',
  manualPaymentsReview: 'manual-payments:review',
  notificationsRead: 'notifications:read',
  reportsRead: 'reports:read',
  usersManage: 'users:manage',
  rolesManage: 'roles:manage',
  tenantsManage: 'tenants:manage',
  auditRead: 'audit:read'
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];
