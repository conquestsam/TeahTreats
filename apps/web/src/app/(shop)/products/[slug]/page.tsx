import { AppShell } from '../../../../components/layout/app-shell';
import { StorefrontProductDetailContent } from '../../../../contents/functional-contents/Storefront/StorefrontProductDetailContent';

export default async function ProductDetailPage({
  params
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  return (
    <AppShell>
      <StorefrontProductDetailContent slug={slug} />
    </AppShell>
  );
}
