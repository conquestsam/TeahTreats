'use client';

import { Button, Group, SimpleGrid, Skeleton, Stack } from '@mantine/core';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { AdminPromotionArchiveModal } from '@/components/functional-components/AdminPromotion/AdminPromotionArchiveModal';
import { AdminPromotionFormModal } from '@/components/functional-components/AdminPromotion/AdminPromotionFormModal';
import { AppPageHeader } from '@/components/ui/app-page-header';

import { AdminPromotionTable } from '@/components/functional-components/AdminPromotion/AdminPromotionTable';
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
    modals.openEdit(promotion);
  };

  const toPayload = (): AdminPromotionInput => {
    const couponCode = form.values.couponCode.trim().toUpperCase();
    return {
      name: form.values.name,
      ...(form.values.description ? { description: form.values.description } : {}),
      ...(form.values.status ? { status: form.values.status as NonNullable<AdminPromotionInput['status']> } : {}),
      discountType: form.values.discountType as AdminPromotionInput['discountType'],
      discountValue: Number(form.values.discountValue),
      ...(form.values.targetType ? { targetType: form.values.targetType as NonNullable<AdminPromotionInput['targetType']> } : {}),
      targetProductIds: toList(form.values.targetProductIds),
      targetCategories: toList(form.values.targetCategories),
      targetBrands: toList(form.values.targetBrands),
      targetCustomerIds: toList(form.values.targetCustomerIds),
      ...(form.values.startsAt ? { startsAt: form.values.startsAt } : {}),
      ...(form.values.endsAt ? { endsAt: form.values.endsAt } : {}),
      ...(form.values.usageLimit ? { usageLimit: Number(form.values.usageLimit) } : {}),
      ...(form.values.perCustomerLimit ? { perCustomerLimit: Number(form.values.perCustomerLimit) } : {}),
      ...(form.values.minimumOrderAmount ? { minimumOrderAmountCents: Number(form.values.minimumOrderAmount) } : {}),
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
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <AppPageHeader
            eyebrow="Promotions & Marketing"
            title="Coupons & Discounts"
            description="Manage tenant discount rules, coupon codes, and promotional campaigns."
            badge="Campaign Engine"
          />
          <Button className="tt-btn-primary" radius="md" onClick={openCreate}>
            + Create Promotion
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <MetricCard label="Total Rules" value={promotions.length} hint="Active & archived" tone="green" />
          <MetricCard
            label="Active Campaigns"
            value={promotions.filter((promotion) => promotion.status === 'active').length}
            hint="Redeemable right now"
            tone="blue"
          />
          <MetricCard
            label="Coupon Codes"
            value={promotions.reduce((total, promotion) => total + promotion.couponCodes.length, 0)}
            hint="Unique promo codes"
            tone="orange"
          />
        </SimpleGrid>

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
          <div style={{ overflowX: 'auto' }}>
            <AdminPromotionTable promotions={promotions} onEdit={openEdit} onArchive={modals.openArchive} />
          </div>
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

// <AdminPromotionFormModal
//   mode="create"
//   opened={modals.mode === 'create'}
//   loading={mutations.createPromotionMutation.isPending}
//   form={form}
//   onClose={closeAndReset}
//   onSubmit={() => mutations.createPromotionMutation.mutate(toPayload())}
// />

// <AdminPromotionFormModal
//   mode="edit"
//   opened={modals.mode === 'edit'}
//   loading={mutations.updatePromotionMutation.isPending}
//   form={form}
//   onClose={closeAndReset}
//   onSubmit={() => {
//     if (modals.selectedPromotion) {
//       mutations.updatePromotionMutation.mutate({
//         promotionId: modals.selectedPromotion.id,
//         input: toPayload()
//       });
//     }
//   }}
// />


function toList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
