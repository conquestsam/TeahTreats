export interface TenantScoped {
  tenantId: string;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
}
export * from './admin-user.js';
export * from './inventory.js';
export * from './cart.js';
export * from './payment.js';
export * from './order.js';
export * from './customer.js';
export * from './storefront.js';
export * from './tenant.js';
export * from './promotion.js';
export * from './loyalty-foundations.js';
export * from './notification.js';
export * from './report.js';
