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

const storefrontAvailabilityQueryOptions = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false
};

export function useStorefrontProductsQuery(query: StorefrontProductQuery) {
  return useQuery({
    queryKey: [...storefrontProductsQueryKey, query],
    queryFn: () => getStorefrontProducts(query),
    ...storefrontAvailabilityQueryOptions
  });
}

export function useStorefrontSearchQuery(query: StorefrontProductQuery, enabled: boolean) {
  return useQuery({
    queryKey: [...storefrontSearchQueryKey, query],
    queryFn: () => searchStorefrontProducts(query),
    enabled,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}

export function useStorefrontProductDetailQuery(slug: string, enabled = true) {
  return useQuery({
    queryKey: [...storefrontProductDetailQueryKey, slug],
    queryFn: () => getStorefrontProduct(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}

export function useStorefrontCollectionsQuery() {
  return useQuery({
    queryKey: storefrontCollectionsQueryKey,
    queryFn: getStorefrontCollections,
    ...storefrontAvailabilityQueryOptions
  });
}

export function useStorefrontRecommendationsQuery() {
  return useQuery({
    queryKey: storefrontRecommendationsQueryKey,
    queryFn: getStorefrontRecommendations,
    ...storefrontAvailabilityQueryOptions
  });
}
