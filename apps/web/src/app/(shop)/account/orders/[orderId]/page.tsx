import { AppShell } from '../../../../../components/layout/app-shell';
import { CustomerOrderDetailContent } from '../../../../../contents/CustomerOrder/CustomerOrderDetailContent';

export default async function CustomerOrderDetailPage({
  params
}: Readonly<{ params: Promise<{ orderId: string }> }>) {
  const { orderId } = await params;
  return (
    <AppShell>
      <CustomerOrderDetailContent orderId={orderId} />
    </AppShell>
  );
}
