export type StorefrontAvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unavailable';

export type StorefrontSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular';

export interface StorefrontSkuSummary {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  active: boolean;
  availableQuantity: number;
  availability: StorefrontAvailabilityStatus;
}

export interface StorefrontProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface StorefrontProductCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  tags: string[];
  dietaryLabels: string[];
  isPerishable: boolean;
  flavor: string | null;
  occasion: string | null;
  image: StorefrontProductImage | null;
  startingPriceCents: number | null;
  currency: string;
  availability: StorefrontAvailabilityStatus;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontProductDetail extends StorefrontProductCard {
  images: StorefrontProductImage[];
  skus: StorefrontSkuSummary[];
}

export interface StorefrontCollection {
  key: string;
  label: string;
  count: number;
}

export interface StorefrontProductList {
  items: StorefrontProductCard[];
  page: number;
  pageSize: number;
  total: number;
}

export interface StorefrontRecommendationSection {
  key: string;
  title: string;
  items: StorefrontProductCard[];
}
