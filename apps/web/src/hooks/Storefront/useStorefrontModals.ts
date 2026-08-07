'use client';

import { useState } from 'react';
import type { StorefrontProductDetail } from '@/types/Storefront/storefrontTypes';

export function useStorefrontModals() {
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProductDetail | null>(null);

  return {
    selectedProduct,
    addToCartOpened: Boolean(selectedProduct),
    openAddToCart: setSelectedProduct,
    closeAddToCart: () => setSelectedProduct(null)
  };
}
