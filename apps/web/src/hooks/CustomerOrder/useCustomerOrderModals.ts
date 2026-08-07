'use client';

import { useState } from 'react';
import type { CustomerOrderListItem } from '@/types/CustomerOrder/customerOrderTypes';

type CustomerOrderModalMode = 'closed' | 'detail' | 'complete';

export function useCustomerOrderModals() {
  const [mode, setMode] = useState<CustomerOrderModalMode>('closed');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderListItem | null>(null);

  const open = (nextMode: CustomerOrderModalMode, order: CustomerOrderListItem) => {
    setSelectedOrder(order);
    setMode(nextMode);
  };

  return {
    mode,
    selectedOrder,
    selectedOrderId: selectedOrder?.id ?? null,
    openDetail: (order: CustomerOrderListItem) => open('detail', order),
    openComplete: (order: CustomerOrderListItem) => open('complete', order),
    closeModal: () => {
      setMode('closed');
      setSelectedOrder(null);
    }
  };
}
