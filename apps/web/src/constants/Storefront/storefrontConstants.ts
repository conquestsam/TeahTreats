import type { StorefrontSortOption } from '@/types/Storefront/storefrontTypes';

export const storefrontTenantId = process.env.NEXT_PUBLIC_TEMP_TENANT_ID ?? 'platform';

export const storefrontProductsQueryKey = ['storefront-products'] as const;
export const storefrontProductDetailQueryKey = ['storefront-product-detail'] as const;
export const storefrontSearchQueryKey = ['storefront-search'] as const;
export const storefrontCollectionsQueryKey = ['storefront-collections'] as const;
export const storefrontRecommendationsQueryKey = ['storefront-recommendations'] as const;

export const storefrontSortOptions: Array<{ value: StorefrontSortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name' }
];

export const storefrontAddToCartInitialValues = {
  skuId: '',
  quantity: 1
};
