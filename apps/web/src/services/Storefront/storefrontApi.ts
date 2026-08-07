import { apiFetch } from '@/lib/api/client';
import { storefrontTenantId } from '@/constants/Storefront/storefrontConstants';
import type {
  StorefrontAddToCartInput,
  StorefrontCollection,
  StorefrontProductDetail,
  StorefrontProductList,
  StorefrontProductQuery,
  StorefrontRecommendationSection
} from '@/types/Storefront/storefrontTypes';
import type { CustomerCartModel } from '@/types/CustomerCart/customerCartTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

const tenantHeaders = {
  'x-tenant-id': storefrontTenantId
};

function toQueryString(query: StorefrontProductQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function getStorefrontProducts(query: StorefrontProductQuery = {}) {
  return apiFetch<ApiEnvelope<StorefrontProductList>>(`/shop/storefront/products${toQueryString(query)}`, {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function getStorefrontProduct(slug: string) {
  return apiFetch<ApiEnvelope<StorefrontProductDetail>>(`/shop/storefront/products/${slug}`, {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function searchStorefrontProducts(query: StorefrontProductQuery) {
  return apiFetch<ApiEnvelope<StorefrontProductList>>(`/shop/storefront/search${toQueryString(query)}`, {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function getStorefrontCollections() {
  return apiFetch<ApiEnvelope<StorefrontCollection[]>>('/shop/storefront/collections', {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function getStorefrontRecommendations() {
  return apiFetch<ApiEnvelope<StorefrontRecommendationSection[]>>('/shop/storefront/recommendations', {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function addStorefrontItemToCart(input: StorefrontAddToCartInput) {
  return apiFetch<ApiEnvelope<CustomerCartModel>>('/shop/cart/items', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
