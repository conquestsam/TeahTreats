'use client';

import { useState } from 'react';
import type { AdminOrderAction, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';

type AdminOrderModalMode = 'closed' | 'detail' | AdminOrderAction;

export function useAdminOrderModals() {
  const [mode, setMode] = useState<AdminOrderModalMode>('closed');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderListItem | null>(null);

  const open = (nextMode: AdminOrderModalMode, order: AdminOrderListItem) => {
    setSelectedOrder(order);
    setMode(nextMode);
  };

  return {
    mode,
    selectedOrder,
    selectedOrderId: selectedOrder?.id ?? null,
    openDetail: (order: AdminOrderListItem) => open('detail', order),
    openAction: (action: AdminOrderAction, order: AdminOrderListItem) => open(action, order),
    closeModal: () => {
      setMode('closed');
      setSelectedOrder(null);
    }
  };
}
