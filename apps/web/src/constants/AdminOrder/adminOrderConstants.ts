export const adminOrdersQueryKey = ['admin-orders'] as const;

export const adminOrderDetailsQueryKey = (orderId: string | null) =>
  ['admin-orders', orderId ?? 'none'] as const;
