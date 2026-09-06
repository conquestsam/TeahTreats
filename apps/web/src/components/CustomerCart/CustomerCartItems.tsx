import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CustomerCartModel } from '@/types/CustomerCart/customerCartTypes';
import { formatMoney } from '@/lib/formatters/money';

interface CustomerCartItemsProps {
  cart: CustomerCartModel;
  updating: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (item: CustomerCartModel['items'][number]) => void;
}

export function CustomerCartItems({
  cart,
  updating,
  onQuantityChange,
  onRemove
}: CustomerCartItemsProps) {
  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <Card key={item.id} className="border-[#342d32] bg-[#1f1d23]">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <p className="truncate text-base font-black text-[#fff7e8]">{item.productName}</p>
              <p className="mt-1 text-sm text-[#bca6a7]">{item.skuName}</p>
              <p className="mt-2 text-lg font-black text-[#ffd98a]">{formatMoney(item.lineTotalCents, item.currency)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                disabled={updating || item.quantity <= 1}
                className="grid h-9 w-9 place-items-center rounded-md bg-[#151319] text-xl font-black text-[#fff7e8] disabled:opacity-40"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="grid h-9 min-w-10 place-items-center rounded-md border border-[#342d32] bg-[#151319] px-3 text-sm font-black text-[#fff7e8]">
                {item.quantity}
              </span>
              <button
                type="button"
                disabled={updating}
                className="grid h-9 w-9 place-items-center rounded-md bg-[#151319] text-xl font-black text-[#fff7e8] disabled:opacity-40"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              >
                +
              </button>
              <Button size="sm" variant="danger" onClick={() => onRemove(item)}>
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
