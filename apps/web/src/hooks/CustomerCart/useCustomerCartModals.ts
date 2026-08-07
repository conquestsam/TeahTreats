'use client';

import { useState } from 'react';
import type { CustomerCartModel } from '@/types/CustomerCart/customerCartTypes';

type CustomerCartModalMode = 'closed' | 'auth' | 'checkout' | 'remove';

export function useCustomerCartModals() {
  const [mode, setMode] = useState<CustomerCartModalMode>('closed');
  const [selectedItem, setSelectedItem] = useState<CustomerCartModel['items'][number] | null>(null);

  return {
    mode,
    selectedItem,
    openAuth: () => setMode('auth'),
    openCheckout: () => setMode('checkout'),
    openRemove: (item: CustomerCartModel['items'][number]) => {
      setSelectedItem(item);
      setMode('remove');
    },
    closeModal: () => {
      setMode('closed');
      setSelectedItem(null);
    }
  };
}
