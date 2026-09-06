import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatMoney } from '@/lib/formatters/money';
import type { CheckoutStartedModel } from '@/types/CustomerCart/customerCartTypes';

export function CustomerCheckoutSummary({
  checkout,
  showAccountPrompt = false
}: {
  checkout: CheckoutStartedModel;
  showAccountPrompt?: boolean;
}) {
  const expiresAtFormatted = new Date(checkout.reservationExpiresAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="mb-8 border-[#f0c66d]/35 bg-[linear-gradient(135deg,#1f1d23,rgba(90,66,22,0.35))]">
      <CardContent className="flex flex-col justify-between gap-5 p-5 md:flex-row md:items-start md:p-7">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="default">Items Reserved</Badge>
            <span className="text-sm text-[#bca6a7]">
              Order <strong className="text-[#fff7e8]">#{checkout.orderId.slice(0, 8)}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#fff7e8]">
            Your order is held for checkout.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#bca6a7]">
            Reserved until <strong className="text-[#ffd98a]">{expiresAtFormatted}</strong>. Complete payment to confirm preparation and delivery handoff.
          </p>

          {checkout.discountCents > 0 && (
            <p className="mt-2 text-sm font-bold text-emerald-400">
              Discount applied: -{formatMoney(checkout.discountCents, checkout.currency)}
            </p>
          )}

          {showAccountPrompt ? (
            <div className="mt-4 rounded-lg border border-[#342d32] bg-[#151319]/80 p-3">
              <p className="text-sm font-black text-[#fff7e8]">Want to save this order?</p>
              <p className="mt-1 text-xs leading-5 text-[#bca6a7]">
                Create an account after payment to keep order history, receipts, and future checkout details together.
              </p>
              <Button asChild variant="secondary" size="sm" className="mt-3">
                <Link href={`/signup?claimOrderId=${checkout.orderId}`}>Create Account</Link>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="md:text-right">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#bca6a7]">
              Reserved Total
            </span>
            <p className="text-3xl font-black text-[#ffd98a]">
              {formatMoney(checkout.totalCents, checkout.currency)}
            </p>
          </div>
          <Button asChild>
            <Link href={`/payment?orderId=${checkout.orderId}` as never}>Continue to Payment</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
