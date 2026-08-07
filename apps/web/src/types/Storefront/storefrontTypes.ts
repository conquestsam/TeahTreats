import type {
  StorefrontAvailabilityStatus,
  StorefrontCollection,
  StorefrontProductCard,
  StorefrontProductDetail,
  StorefrontProductList,
  StorefrontRecommendationSection,
  StorefrontSkuSummary,
  StorefrontSortOption
} from '@snacks/shared';

export type {
  StorefrontAvailabilityStatus,
  StorefrontCollection,
  StorefrontProductCard,
  StorefrontProductDetail,
  StorefrontProductList,
  StorefrontRecommendationSection,
  StorefrontSkuSummary,
  StorefrontSortOption
};

export interface StorefrontProductQuery {
  page?: number | undefined;
  pageSize?: number | undefined;
  q?: string | undefined;
  category?: string | undefined;
  brand?: string | undefined;
  tag?: string | undefined;
  sort?: StorefrontSortOption | undefined;
}

export interface StorefrontAddToCartInput {
  skuId: string;
  quantity: number;
}
