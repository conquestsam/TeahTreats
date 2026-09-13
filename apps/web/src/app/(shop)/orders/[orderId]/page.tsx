import type { Metadata } from 'next';
import { CustomerOrderDetailContent } from '../../../../contents/CustomerOrder/CustomerOrderDetailContent';
import { privatePageMetadata } from '../../../../lib/seo/metadata';

export const metadata: Metadata = privatePageMetadata(
  'Order Details',
  'Private TeshTreats order lookup page for customer order status and readiness updates.',
);

export default async function PublicCustomerOrderDetailPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <CustomerOrderDetailContent orderId={orderId} />;
}
