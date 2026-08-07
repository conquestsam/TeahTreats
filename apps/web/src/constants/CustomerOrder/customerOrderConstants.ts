export const customerOrdersQueryKey = ['customer-orders'] as const;
export const customerOrderDetailsQueryKey = (orderId: string | null) =>
  ['customer-orders', orderId ?? 'none'] as const;
