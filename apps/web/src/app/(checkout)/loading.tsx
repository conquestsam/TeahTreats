import { AppLoadingState } from '@/components/ui/AppLoadingState';

export default function CheckoutLoading() {
  return <AppLoadingState message="Securing checkout" variant="customer" />;
}
