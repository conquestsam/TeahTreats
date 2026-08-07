'use client';

import { Badge, Button, Group, Image, Paper, SimpleGrid, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { AdminProductStatusBadge } from './AdminProductStatusBadge';
import { formatMoney } from '@/lib/formatters/money';
import type {
  AdminProductActionHandlers,
  AdminProductModel
} from '@/types/AdminProduct/adminProductTypes';

export function AdminProductGrid({
  products,
  onDetails,
  onEdit,
  onArchive,
  onRestore
}: Readonly<AdminProductActionHandlers & { products: AdminProductModel[] }>) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {products.map((product) => {
        const prices = product.skus.map((s) => s.priceCents).filter((p) => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const priceDisplay =
          prices.length === 0
            ? 'No SKUs'
            : minPrice === maxPrice
              ? formatMoney(minPrice, 'USD')
              : `${formatMoney(minPrice, 'USD')} - ${formatMoney(maxPrice, 'USD')}`;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ minWidth: 0 }}
          >
            <Paper
              p="md"
              style={{
                background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.98))',
                border: '1px solid rgba(184, 147, 62, 0.18)',
                borderRadius: 14,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 140,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--tt-black)',
                    marginBottom: 12,
                    border: '1px solid rgba(184, 147, 62, 0.1)'
                  }}
                >
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      h={140}
                      w="100%"
                      fit="cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-xs font-semibold text-amber-600/60">
                      No Image Asset
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <AdminProductStatusBadge status={product.status} />
                  </div>
                </div>

                <Text fw={700} style={{ color: 'var(--tt-cream)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </Text>

                <Group gap={6} mt={4} wrap="nowrap" style={{ minWidth: 0 }}>
                  {product.brand ? (
                    <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>
                      {product.brand}
                    </Text>
                  ) : null}
                  {product.brand && product.category ? (
                    <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>
                      •
                    </Text>
                  ) : null}
                  {product.category ? (
                    <Badge size="xs" variant="outline" color="amber" style={{ textTransform: 'capitalize' }}>
                      {product.category}
                    </Badge>
                  ) : null}
                </Group>

                <Group justify="space-between" align="center" mt="sm">
                  <Text size="sm" fw={800} style={{ color: 'var(--tt-gold-light)' }}>
                    {priceDisplay}
                  </Text>
                  <Badge size="xs" styles={{ root: { background: 'rgba(255,255,255,0.06)', color: 'var(--tt-cream-muted)' } }}>
                    {product.skus.length} {product.skus.length === 1 ? 'SKU' : 'SKUs'}
                  </Badge>
                </Group>
              </div>

              <Group gap="xs" mt="md" wrap="nowrap">
                <Button
                  size="xs"
                  variant="filled"
                  style={{ flex: 1, background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid rgba(184, 147, 62, 0.3)' }}
                  onClick={() => onDetails(product)}
                >
                  View SKUs
                </Button>

                <Button
                  size="xs"
                  variant="subtle"
                  style={{ color: 'var(--tt-cream-muted)' }}
                  onClick={() => onEdit(product)}
                >
                  Edit
                </Button>

                {product.status === 'archived' ? (
                  <Button
                    size="xs"
                    variant="subtle"
                    style={{ color: '#4ade80' }}
                    onClick={() => onRestore(product)}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="subtle"
                    style={{ color: '#f87171' }}
                    onClick={() => onArchive(product)}
                  >
                    Archive
                  </Button>
                )}
              </Group>
            </Paper>
          </motion.div>
        );
      })}
    </SimpleGrid>
  );
}
