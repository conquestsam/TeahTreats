import { ActionIcon, Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { CustomerCartModel } from '@/types/CustomerCart/customerCartTypes';

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
    <Stack>
      {cart.items.map((item) => (
        <Paper key={item.id} withBorder p="md">
          <Group justify="space-between" align="center" gap="md">
            <div>
              <Text fw={700}>{item.productName}</Text>
              <Text size="sm" c="dimmed">
                {item.skuName}
              </Text>
              <Text size="sm">${(item.lineTotalCents / 100).toFixed(2)}</Text>
            </div>
            <Group gap="xs">
              <ActionIcon
                variant="light"
                disabled={updating || item.quantity <= 1}
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              >
                -
              </ActionIcon>
              <Text w={28} ta="center">
                {item.quantity}
              </Text>
              <ActionIcon
                variant="light"
                disabled={updating}
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              >
                +
              </ActionIcon>
              <Button size="xs" color="red" variant="light" onClick={() => onRemove(item)}>
                Remove
              </Button>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
