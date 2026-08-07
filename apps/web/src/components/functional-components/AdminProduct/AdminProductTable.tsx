import { Badge, Image, Group, Paper, Table, Text } from '@mantine/core';
import { AnimatePresence } from 'motion/react';
import { AdminProductActions } from './AdminProductActions';
import { AdminProductStatusBadge } from './AdminProductStatusBadge';
import { formatMoney } from '@/lib/formatters/money';
import type {
  AdminProductActionHandlers,
  AdminProductModel
} from '@/types/AdminProduct/adminProductTypes';

export function AdminProductTable({
  products,
  onDetails,
  onEdit,
  onArchive,
  onRestore
}: Readonly<AdminProductActionHandlers & { products: AdminProductModel[] }>) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden" style={{ borderRadius: 14 }}>
      <Table.ScrollContainer minWidth={860}>
        <Table verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead style={{ background: 'rgba(20, 20, 20, 0.95)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Product</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Status</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Category</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Price Range</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>SKUs</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Updated</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700, textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <AnimatePresence initial={false}>
              {products.map((product) => {
                const prices = product.skus.map((s) => s.priceCents).filter((p) => p > 0);
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                const priceDisplay =
                  prices.length === 0
                    ? '—'
                    : minPrice === maxPrice
                      ? formatMoney(minPrice, 'USD')
                      : `${formatMoney(minPrice, 'USD')} - ${formatMoney(maxPrice, 'USD')}`;

                return (
                  <Table.Tr key={product.id} style={{ borderBottom: '1px solid rgba(184, 147, 62, 0.1)' }}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        {product.images[0] ? (
                          <Image src={product.images[0].url} alt={product.images[0].alt ?? product.name} h={44} w={54} fit="cover" radius="md" />
                        ) : (
                          <div className="flex h-11 w-[54px] shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold text-amber-600/70 border border-amber-900/30">
                            NO IMG
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <Text fw={700} style={{ color: 'var(--tt-cream)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.name}
                          </Text>
                          <Text size="xs" style={{ color: 'var(--tt-cream-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.brand ? `${product.brand} • ` : ''}{product.slug}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <AdminProductStatusBadge status={product.status} />
                    </Table.Td>
                    <Table.Td>
                      {product.category ? (
                        <Badge size="xs" variant="outline" color="amber" style={{ textTransform: 'capitalize' }}>
                          {product.category}
                        </Badge>
                      ) : (
                        <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>Uncategorized</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={700} style={{ color: 'var(--tt-gold-light)' }}>
                        {priceDisplay}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" styles={{ root: { background: 'rgba(255,255,255,0.06)', color: 'var(--tt-cream-muted)' } }}>
                        {product.skus.length} {product.skus.length === 1 ? 'variant' : 'variants'}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ color: 'var(--tt-cream-muted)', fontSize: '0.8rem' }}>
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <AdminProductActions
                        product={product}
                        onDetails={onDetails}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onRestore={onRestore}
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </AnimatePresence>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
