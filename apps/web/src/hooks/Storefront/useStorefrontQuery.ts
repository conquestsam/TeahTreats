'use client';

import { useQuery } from '@tanstack/react-query';
import {
  storefrontCollectionsQueryKey,
  storefrontProductDetailQueryKey,
  storefrontProductsQueryKey,
  storefrontRecommendationsQueryKey,
  storefrontSearchQueryKey
} from '@/constants/Storefront/storefrontConstants';
import {
  getStorefrontCollections,
  getStorefrontProduct,
  getStorefrontProducts,
  getStorefrontRecommendations,
  searchStorefrontProducts
} from '@/services/Storefront/storefrontApi';
import type { StorefrontProductQuery } from '@/types/Storefront/storefrontTypes';

export function useStorefrontProductsQuery(query: StorefrontProductQuery) {
  return useQuery({
    queryKey: [...storefrontProductsQueryKey, query],
    queryFn: () => getStorefrontProducts(query)
  });
}

export function useStorefrontSearchQuery(query: StorefrontProductQuery, enabled: boolean) {
  return useQuery({
    queryKey: [...storefrontSearchQueryKey, query],
    queryFn: () => searchStorefrontProducts(query),
    enabled
  });
}

export function useStorefrontProductDetailQuery(slug: string) {
  return useQuery({
    queryKey: [...storefrontProductDetailQueryKey, slug],
    queryFn: () => getStorefrontProduct(slug),
    enabled: Boolean(slug)
  });
}

export function useStorefrontCollectionsQuery() {
  return useQuery({
    queryKey: storefrontCollectionsQueryKey,
    queryFn: getStorefrontCollections
  });
}

export function useStorefrontRecommendationsQuery() {
  return useQuery({
    queryKey: storefrontRecommendationsQueryKey,
    queryFn: getStorefrontRecommendations
  });
}
