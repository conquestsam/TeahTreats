'use client';

import { Badge, Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { AdminPromotionArchiveModal } from '@/components/AdminPromotion/AdminPromotionArchiveModal';
import { AdminPromotionFormModal } from '@/components/AdminPromotion/AdminPromotionFormModal';
import { AdminPromotionMobileCard } from '@/components/AdminPromotion/AdminPromotionMobileCard';
import { AppPageHeader } from '@/components/ui/app-page-header';

import { AdminPromotionTable } from '@/components/AdminPromotion/AdminPromotionTable';
import { useAdminPromotionForm } from '@/hooks/AdminPromotion/useAdminPromotionForms';
import { useAdminPromotionModals } from '@/hooks/AdminPromotion/useAdminPromotionModals';
import { useAdminPromotionMutations } from '@/hooks/AdminPromotion/useAdminPromotionMutations';
import { useAdminPromotionQuery } from '@/hooks/AdminPromotion/useAdminPromotionQuery';
import type { AdminPromotionInput, AdminPromotionModel } from '@/types/AdminPromotion/adminPromotionTypes';

export function AdminPromotionContent() {
  const promotionsQuery = useAdminPromotionQuery();
  const modals = useAdminPromotionModals();
  const form = useAdminPromotionForm();
  const promotions = promotionsQuery.data ?? [];
  const [search, setSearch] = useState('');

  const filteredPromotions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return promotions;
    }
    return promotions.filter((promotion) =>
      [
        promotion.name,
        promotion.description,
        promotion.status,
        promotion.discountType,
        promotion.targetType,
        promotion.couponCodes.map((coupon) => coupon.code).join(' '),
        promotion.targetCategories.join(' '),
        promotion.targetBrands.join(' ')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [promotions, search]);

  const activeCount = promotions.filter((promotion) => promotion.status === 'active').length;
  const scheduledCount = promotions.filter((promotion) => promotion.status === 'draft' && isFuture(promotion.startsAt)).length;
  const expiringCount = promotions.filter((promotion) => isExpiringSoon(promotion.endsAt)).length;
  const selectedPromotion = modals.selectedPromotion ?? filteredPromotions[0] ?? null;

  const closeAndReset = () => {
    form.reset();
    modals.closeModal();
  };
  const mutations = useAdminPromotionMutations(closeAndReset);

  const openCreate = () => {
    form.reset();
    modals.openCreate();
  };

  const openEdit = (promotion: AdminPromotionModel) => {
    form.setValues({
      name: promotion.name,
      description: promotion.description ?? '',
      status: promotion.status,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      targetType: promotion.targetType,
      targetProductIds: promotion.targetProductIds.join(', '),
      targetCategories: promotion.targetCategories.join(', '),
      targetBrands: promotion.targetBrands.join(', '),
      targetCustomerIds: promotion.targetCustomerIds.join(', '),
      startsAt: promotion.startsAt ?? '',
      endsAt: promotion.endsAt ?? '',
      usageLimit: promotion.usageLimit?.toString() ?? '',
      perCustomerLimit: promotion.perCustomerLimit?.toString() ?? '',
      minimumOrderAmount: promotion.minimumOrderAmountCents?.toString() ?? '',
      stackable: promotion.stackable,
      couponCode: promotion.couponCodes[0]?.code ?? '',
      couponUsageLimit: promotion.couponCodes[0]?.usageLimit?.toString() ?? ''
    });
    if (promotion.discountType === 'fixed_amount' || promotion.discountType === 'bundle') {
      form.setFieldValue('discountValue', promotion.discountValue / 100);
    }
    if (promotion.minimumOrderAmountCents) {
      form.setFieldValue('minimumOrderAmount', (promotion.minimumOrderAmountCents / 100).toString());
    }
    modals.openEdit(promotion);
  };

  const toPayload = (): AdminPromotionInput => {
    const couponCode = form.values.couponCode.trim().toUpperCase();
    const discountValue =
      form.values.discountType === 'fixed_amount' || form.values.discountType === 'bundle'
        ? Math.round(Number(form.values.discountValue) * 100)
        : Number(form.values.discountValue);
    return {
      name: form.values.name,
      ...(form.values.description ? { description: form.values.description } : {}),
      ...(form.values.status ? { status: form.values.status as NonNullable<AdminPromotionInput['status']> } : {}),
      discountType: form.values.discountType as AdminPromotionInput['discountType'],
      discountValue,
      ...(form.values.targetType ? { targetType: form.values.targetType as NonNullable<AdminPromotionInput['targetType']> } : {}),
      targetProductIds: toList(form.values.targetProductIds),
      targetCategories: toList(form.values.targetCategories),
      targetBrands: toList(form.values.targetBrands),
      targetCustomerIds: toList(form.values.targetCustomerIds),
      ...(form.values.startsAt ? { startsAt: form.values.startsAt } : {}),
      ...(form.values.endsAt ? { endsAt: form.values.endsAt } : {}),
      ...(form.values.usageLimit ? { usageLimit: Number(form.values.usageLimit) } : {}),
      ...(form.values.perCustomerLimit ? { perCustomerLimit: Number(form.values.perCustomerLimit) } : {}),
      ...(form.values.minimumOrderAmount ? { minimumOrderAmountCents: Math.round(Number(form.values.minimumOrderAmount) * 100) } : {}),
      stackable: form.values.stackable,
      couponCodes: couponCode
        ? [
          {
            code: couponCode,
            active: true,
            ...(form.values.couponUsageLimit ? { usageLimit: Number(form.values.couponUsageLimit) } : {})
          }
        ]
        : []
    };
  };

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <section className="admin-mobile-workflow-header">
          <div className="admin-mobile-brand-row">
            <div>
              <Text fw={950} className="admin-mobile-brand-title">TeshTreats <span>Promos</span></Text>
              <Text className="admin-mobile-live-dot">Live offers</Text>
            </div>
            <span className="admin-mobile-avatar">A</span>
          </div>
          <Group justify="space-between" align="end" gap="md" wrap="nowrap">
            <div>
              <Text fw={900} className="admin-mobile-page-title">Promotions</Text>
              <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Create, edit, and review customer discounts.</Text>
            </div>
            <Button size="xs" className="tt-btn-primary" onClick={openCreate}>+ Promo</Button>
          </Group>
        </section>

        <div className="admin-desktop-page-header">
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <AppPageHeader
              eyebrow="Promotions & Discounts"
              title="Promotions & Discounts"
              description="Create simple discount codes, schedule offers, and review usage rules."
              badge="Live Guest View"
            />
            <Button className="tt-btn-primary" radius="md" onClick={openCreate}>
              + Craft Promo
            </Button>
          </Group>
        </div>

        <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics admin-promotion-metrics">
          <MetricCard label="Active Codes" value={activeCount} hint="Available now" tone="green" />
          <MetricCard
            label="Scheduled"
            value={scheduledCount}
            hint="Queued"
            tone="blue"
          />
          <MetricCard
            label="Expiring"
            value={expiringCount}
            hint="Review soon"
            tone="orange"
          />
          <MetricCard label="Total Codes" value={promotions.reduce((total, promotion) => total + promotion.couponCodes.length, 0)} hint="Created" tone="gray" />
        </SimpleGrid>

        <div className="admin-mobile-queue-tools admin-promotion-tools">
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search promo, code, or category..."
            aria-label="Search promotions"
          />
          <Group gap="xs" wrap="nowrap" className="admin-mobile-tabs-scroll">
            <Badge variant="light">All {promotions.length}</Badge>
            <Badge variant="light" color="green">Live {activeCount}</Badge>
            <Badge variant="light" color="blue">Scheduled {scheduledCount}</Badge>
            <Badge variant="light" color="gray">Paused {promotions.filter((promotion) => promotion.status === 'archived').length}</Badge>
          </Group>
        </div>

        {promotionsQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Skeleton h={120} radius="md" />
            <Skeleton h={120} radius="md" />
          </SimpleGrid>
        ) : promotionsQuery.isError ? (
          <StateCard title="Promotions unavailable" description="Check your session and permissions, then try again." tone="warning" />
        ) : promotions.length === 0 ? (
          <StateCard
            title="No promotions yet"
            description="Create a coupon when you are ready to run a discount."
            action={{ label: 'Create Promotion', onClick: openCreate }}
          />
        ) : (
          <>
            <div className="admin-promotion-mobile-list">
              {filteredPromotions.map((promotion) => (
                <AdminPromotionMobileCard key={promotion.id} promotion={promotion} onEdit={openEdit} onArchive={modals.openArchive} />
              ))}
            </div>

            <div className="admin-promotion-desktop-workspace">
              <AdminPromotionTable promotions={filteredPromotions} onEdit={openEdit} onArchive={modals.openArchive} />
              <PromotionPreviewPanel promotion={selectedPromotion} />
            </div>
          </>
        )}
      </Stack>

      <AdminPromotionFormModal
        mode="create"
        opened={modals.mode === 'create'}
        loading={mutations.createPromotionMutation.isPending}
        form={form}
        onClose={closeAndReset}
        onSubmit={() => mutations.createPromotionMutation.mutate(toPayload())}
      />

      <AdminPromotionFormModal
        mode="edit"
        opened={modals.mode === 'edit'}
        loading={mutations.updatePromotionMutation.isPending}
        form={form}
        onClose={closeAndReset}
        onSubmit={() => {
          if (modals.selectedPromotion) {
            mutations.updatePromotionMutation.mutate({
              promotionId: modals.selectedPromotion.id,
              input: toPayload()
            });
          }
        }}
      />

      <AdminPromotionArchiveModal
        opened={modals.mode === 'archive'}
        promotionName={modals.selectedPromotion?.name ?? ''}
        loading={mutations.archivePromotionMutation.isPending}
        onClose={closeAndReset}
        onConfirm={() => {
          if (modals.selectedPromotion) {
            mutations.archivePromotionMutation.mutate(modals.selectedPromotion.id);
          }
        }}
      />
    </div>
  );
}


function toList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isFuture(value: string | null) {
  return value ? new Date(value).getTime() > Date.now() : false;
}

function isExpiringSoon(value: string | null) {
  if (!value) return false;
  const ms = new Date(value).getTime() - Date.now();
  return ms > 0 && ms <= 7 * 24 * 60 * 60 * 1000;
}

function PromotionPreviewPanel({ promotion }: { promotion: AdminPromotionModel | null }) {
  if (!promotion) {
    return (
      <Paper withBorder className="enterprise-panel admin-promotion-preview-panel">
        <Text fw={900}>Selected Promo</Text>
        <Text size="sm" c="dimmed">Choose a promotion to preview customer-facing details.</Text>
      </Paper>
    );
  }

  const minimum = promotion.minimumOrderAmountCents ? formatUsd(promotion.minimumOrderAmountCents) : 'No minimum';
  return (
    <Paper withBorder className="enterprise-panel admin-promotion-preview-panel">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" tt="uppercase" fw={900} style={{ color: '#ffd98a' }}>Guest Preview</Text>
          <Text fw={950} size="lg">{promotion.name}</Text>
        </div>
        <Badge variant="light" color={promotion.status === 'active' ? 'green' : 'gray'}>{promotion.status}</Badge>
      </Group>
      <div className="admin-promotion-preview-hero">
        <Text size="xs" tt="uppercase" fw={900}>{promotion.couponCodes[0]?.code ?? 'No code'}</Text>
        <Text fw={950}>{formatPromotionDiscount(promotion)}</Text>
        <Text size="sm">{promotion.description ?? 'Ready for selected customers.'}</Text>
      </div>
      <div className="admin-promotion-preview-lines">
        <span>Minimum order</span><strong>{minimum}</strong>
        <span>Customer limit</span><strong>{promotion.perCustomerLimit ?? 'No limit'}</strong>
        <span>Usage limit</span><strong>{promotion.usageLimit ?? 'No limit'}</strong>
      </div>
      <Button variant="light" fullWidth onClick={() => undefined}>Preview Folio</Button>
    </Paper>
  );
}

function formatPromotionDiscount(promotion: AdminPromotionModel) {
  if (promotion.discountType === 'percentage' || promotion.discountType === 'first_order') {
    return `${promotion.discountValue}% off`;
  }
  if (promotion.discountType === 'free_shipping') {
    return 'Free delivery';
  }
  return `${formatUsd(promotion.discountValue)} off`;
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
