import { CustomerOrderDetailContent } from '../../../../contents/CustomerOrder/CustomerOrderDetailContent';

export default async function PublicCustomerOrderDetailPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <CustomerOrderDetailContent orderId={orderId} />;
}
