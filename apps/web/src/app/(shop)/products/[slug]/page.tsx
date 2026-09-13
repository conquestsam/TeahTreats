import type { Metadata } from 'next';
import { AppShell } from '../../../../components/layout/app-shell';
import { StorefrontProductDetailContent } from '../../../../contents/Storefront/StorefrontProductDetailContent';
import { createPageMetadata } from '../../../../lib/seo/metadata';
import { storefrontTenantId } from '../../../../constants/Storefront/storefrontConstants';
import type { ApiEnvelope, StorefrontProductDetail } from '@snacks/shared';

type ProductDetailParams = Readonly<{ params: Promise<{ slug: string }> }>;

export async function generateMetadata({ params }: ProductDetailParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductForMetadata(slug);
  const title = product?.name ? `${product.name} | TeshTreats` : 'TeshTreats Product';
  const description =
    product?.description ??
    product?.category ??
    'View product details, availability, pricing, and snack options from TeshTreats.';

  return createPageMetadata({
    title,
    description,
    path: `/products/${slug}`,
    image: product?.image?.url ?? product?.images[0]?.url ?? null,
    keywords: [product?.category, product?.brand, product?.flavor, product?.occasion, ...(product?.tags ?? [])]
      .filter((value): value is string => Boolean(value))
  });
}

export default async function ProductDetailPage({
  params
}: ProductDetailParams) {
  const { slug } = await params;
  return (
    <AppShell>
      <StorefrontProductDetailContent slug={slug} />
    </AppShell>
  );
}

async function getProductForMetadata(slug: string) {
  for (const apiBaseUrl of apiBaseUrls()) {
    try {
      const response = await fetch(`${apiBaseUrl}/shop/storefront/products/${slug}`, {
        headers: { 'x-tenant-id': storefrontTenantId },
        next: { revalidate: 300 }
      });

      if (!response.ok) {
        continue;
      }

      const body = (await response.json()) as ApiEnvelope<StorefrontProductDetail>;
      return body.data;
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
