'use client';

import { Button, Drawer, Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useGroupCartMutations } from '@/hooks/GroupCart/useGroupCartMutations';
import { useGroupCartQuery } from '@/hooks/GroupCart/useGroupCartQuery';
import type { CustomerCartModel } from '@/types/CustomerCart/customerCartTypes';

interface GroupCartDrawerProps {
  opened: boolean;
  cart: CustomerCartModel | undefined;
  onClose: () => void;
}

export function GroupCartDrawer({ opened, cart, onClose }: GroupCartDrawerProps) {
  const [name, setName] = useState('Office snack run');
  const [selectedGroupCartId, setSelectedGroupCartId] = useState<string | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState('');
  const groupCartsQuery = useGroupCartQuery();
  const mutations = useGroupCartMutations(onClose);
  const groupCarts = groupCartsQuery.data ?? [];
  const openGroupCartOptions = groupCarts
    .filter((groupCart) => groupCart.status === 'open')
    .map((groupCart) => ({ value: groupCart.id, label: groupCart.name }));
  const cartItemOptions = (cart?.items ?? []).map((item) => ({
    value: item.skuId,
    label: `${item.productName} - ${item.skuName}`
  }));

  return (
    <Drawer opened={opened} onClose={onClose} title="Group Cart" position="right" size="lg">
      <Stack gap="lg">
        <Paper withBorder p="md">
          <Stack gap="sm">
            <Text fw={850}>Step 1: Create a shared cart</Text>
            <TextInput label="Name" value={name} onChange={(event) => setName(event.currentTarget.value)} />
            <Button loading={mutations.createMutation.isPending} onClick={() => mutations.createMutation.mutate({ name })}>
              Create Group Cart
            </Button>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Stack gap="sm">
            <Text fw={850}>Step 2: Add one cart item</Text>
            <Select
              label="Group cart"
              data={openGroupCartOptions}
              value={selectedGroupCartId}
              onChange={setSelectedGroupCartId}
              placeholder="Choose a group cart"
            />
            <Select
              label="Snack"
              data={cartItemOptions}
              value={selectedSkuId}
              onChange={setSelectedSkuId}
              placeholder="Choose from your cart"
            />
            <TextInput
              label="Name"
              placeholder="Ada"
              value={participantName}
              onChange={(event) => setParticipantName(event.currentTarget.value)}
            />
            <Button
              variant="light"
              disabled={!selectedGroupCartId || !selectedSkuId}
              loading={mutations.addItemMutation.isPending}
              onClick={() => {
                const item = cart?.items.find((cartItem) => cartItem.skuId === selectedSkuId);
                if (selectedGroupCartId && selectedSkuId && item) {
                  mutations.addItemMutation.mutate({
                    groupCartId: selectedGroupCartId,
                    input: {
                      skuId: selectedSkuId,
                      quantity: item.quantity,
                      ...(participantName ? { participantName } : {})
                    }
                  });
                }
              }}
            >
              Add To Group Cart
            </Button>
          </Stack>
        </Paper>

        <Stack gap="sm">
          <Text fw={850}>Step 3: Copy to cart when ready</Text>
          {groupCarts.length === 0 ? (
            <Text size="sm" c="dimmed">No group carts yet.</Text>
          ) : (
            groupCarts.map((cart) => (
              <Paper key={cart.id} withBorder p="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={800}>{cart.name}</Text>
                    <Text size="xs" c="dimmed">{cart.status}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">Share token: {cart.shareToken}</Text>
                  <Text size="sm">{cart.items.length} items collected</Text>
                  <Button
                    variant="light"
                    disabled={cart.status !== 'open'}
                    loading={mutations.mergeMutation.isPending}
                    onClick={() => mutations.mergeMutation.mutate(cart.id)}
                  >
                    Copy Items To Cart
                  </Button>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}
