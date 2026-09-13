import type { MetadataRoute } from 'next';
import type { ApiEnvelope, StorefrontProductList } from '@snacks/shared';
import { storefrontTenantId } from '@/constants/Storefront/storefrontConstants';
import { absoluteUrl, publicSeoRoutes } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = publicSeoRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.path === '/' || route.path === '/products' ? 'daily' as const : 'weekly' as const,
    priority: route.priority
  }));
  const products = await getProductSitemapRoutes();

  return [...staticRoutes, ...products];
}

async function getProductSitemapRoutes(): Promise<MetadataRoute.Sitemap> {
  const response = await fetchStorefrontProducts();
  if (!response?.ok) {
    return [];
  }

  try {
    const body = (await response.json()) as ApiEnvelope<StorefrontProductList>;
    return body.data.items.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85
    }));
  } catch {
    return [];
  }
}

async function fetchStorefrontProducts() {
  for (const apiBaseUrl of apiBaseUrls()) {
    try {
      const response = await fetch(`${apiBaseUrl}/shop/storefront/products?page=1&pageSize=48&sort=newest`, {
        headers: { 'x-tenant-id': storefrontTenantId },
        next: { revalidate: 300 }
      });

      if (response.ok) {
        return response;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function apiBaseUrls() {
  const configured = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
  const urls = [configured];

  if (configured.includes('localhost')) {
    urls.push(configured.replace('localhost', '127.0.0.1'));
  }

  return [...new Set(urls)];
}
