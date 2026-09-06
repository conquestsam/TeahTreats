'use client';

import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdminApprovalSettingsModal } from '@/components/AdminSettings/AdminApprovalSettingsModal';
import { AdminBusinessProfileModal } from '@/components/AdminSettings/AdminBusinessProfileModal';

import { AdminManualPaymentMethodModal } from '@/components/AdminSettings/AdminManualPaymentMethodModal';
import { AdminManualPaymentMethodTable } from '@/components/AdminSettings/AdminManualPaymentMethodTable';
import { AdminNotificationChannelsModal } from '@/components/AdminSettings/AdminNotificationChannelsModal';
import { AdminSettingsConfirmModal } from '@/components/AdminSettings/AdminSettingsConfirmModal';
import {
  useAdminApprovalSettingsForm,
  useAdminBusinessProfileForm,
  useAdminManualPaymentMethodForm,
  useAdminNotificationSettingsForm
} from '@/hooks/AdminSettings/useAdminSettingsForms';
import { useAdminSettingsModals } from '@/hooks/AdminSettings/useAdminSettingsModals';
import { useAdminSettingsMutations } from '@/hooks/AdminSettings/useAdminSettingsMutations';
import { useAdminSettingsQuery } from '@/hooks/AdminSettings/useAdminSettingsQuery';
import type {
  AdminBusinessProfileInput,
  AdminManualPaymentMethodInput,
  AdminManualPaymentMethodModel
} from '@/types/AdminSettings/adminSettingsTypes';

export function AdminSettingsContent() {
  const settingsQuery = useAdminSettingsQuery();
  const modals = useAdminSettingsModals();
  const businessForm = useAdminBusinessProfileForm();
  const approvalForm = useAdminApprovalSettingsForm();
  const notificationForm = useAdminNotificationSettingsForm();
  const manualMethodForm = useAdminManualPaymentMethodForm();
  const settings = settingsQuery.data;
  const tenant = settings?.tenant;
  const manualPaymentMethods = settings?.manualPaymentMethods ?? [];

  const closeAndReset = () => {
    manualMethodForm.reset();
    modals.closeModal();
  };

  const mutations = useAdminSettingsMutations(closeAndReset);

  const openBusinessProfile = () => {
    if (!tenant) return;
    businessForm.setValues({
      name: tenant.name,
      businessEmail: tenant.businessEmail ?? '',
      businessPhone: tenant.businessPhone ?? '',
      defaultCurrency: tenant.defaultCurrency,
      timezone: tenant.timezone,
      addressLine1: tenant.settings.businessAddress?.line1 ?? '',
      addressLine2: tenant.settings.businessAddress?.line2 ?? '',
      city: tenant.settings.businessAddress?.city ?? '',
      state: tenant.settings.businessAddress?.state ?? '',
      postalCode: tenant.settings.businessAddress?.postalCode ?? '',
      country: tenant.settings.businessAddress?.country ?? 'US'
    });
    modals.openBusiness();
  };

  const openApprovalRules = () => {
    if (!tenant) return;
    approvalForm.setValues({
      delegatedRoleApprovalRequired: tenant.delegatedRoleApprovalRequired
    });
    modals.openApproval();
  };

  const openNotificationChannels = () => {
    if (!tenant) return;
    notificationForm.setValues({
      orderReadinessNotificationChannels: tenant.settings.orderReadinessNotificationChannels
    });
    modals.openNotifications();
  };

  const openCreateManualMethod = () => {
    manualMethodForm.reset();
    modals.openManualCreate();
  };

  const openEditManualMethod = (method: AdminManualPaymentMethodModel) => {
    manualMethodForm.setValues({
      key: method.key,
      label: method.label,
      instructions: method.instructions,
      active: method.active
    });
    modals.openManualEdit(method);
  };

  const toBusinessPayload = (): AdminBusinessProfileInput => ({
    name: businessForm.values.name,
    ...(businessForm.values.businessEmail ? { businessEmail: businessForm.values.businessEmail } : {}),
    ...(businessForm.values.businessPhone ? { businessPhone: businessForm.values.businessPhone } : {}),
    defaultCurrency: businessForm.values.defaultCurrency,
    timezone: businessForm.values.timezone,
    businessAddress: {
      ...(businessForm.values.addressLine1 ? { line1: businessForm.values.addressLine1 } : {}),
      ...(businessForm.values.addressLine2 ? { line2: businessForm.values.addressLine2 } : {}),
      ...(businessForm.values.city ? { city: businessForm.values.city } : {}),
      ...(businessForm.values.state ? { state: businessForm.values.state } : {}),
      ...(businessForm.values.postalCode ? { postalCode: businessForm.values.postalCode } : {}),
      ...(businessForm.values.country ? { country: businessForm.values.country } : {})
    }
  });

  const toManualMethodPayload = (): AdminManualPaymentMethodInput => ({
    key: manualMethodForm.values.key,
    label: manualMethodForm.values.label,
    instructions: manualMethodForm.values.instructions,
    active: manualMethodForm.values.active
  });

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <section className="admin-mobile-workflow-header">
          <div className="admin-mobile-brand-row">
            <div>
              <Text fw={950} className="admin-mobile-brand-title">TeshTreats <span>Settings</span></Text>
              <Text className="admin-mobile-live-dot">Store live</Text>
            </div>
            <span className="admin-mobile-avatar">A</span>
          </div>
          <Title order={1} className="admin-mobile-page-title">Admin Settings</Title>
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Manage business details, payments, delivery, and alerts.</Text>
        </section>

        <div className="admin-desktop-page-header">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={900} tt="uppercase" style={{ color: '#ffd98a' }}>Settings</Text>
              <Title order={1}>Admin Settings</Title>
              <Text c="dimmed">Manage business details, payments, delivery, and team alerts.</Text>
            </div>
            <Badge variant="default">Live settings</Badge>
          </Group>
        </div>

        {settingsQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Skeleton h={150} />
            <Skeleton h={150} />
          </SimpleGrid>
        ) : settingsQuery.isError || !settings ? (
          <StateCard
            title="Settings unavailable"
            description="Check your session and tenant access, then try again."
            tone="warning"
          />
        ) : (
          <>
            <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics admin-settings-metrics">
              <MetricCard
                label="Store"
                value={tenant?.name ?? 'Store'}
                hint={tenant?.active ? 'Store is live' : 'Store is off'}
                tone={tenant?.active ? 'green' : 'gray'}
              />
              <MetricCard
                label="Approval"
                value={tenant?.delegatedRoleApprovalRequired ? 'Review' : 'Direct'}
                hint="Team access"
                tone="blue"
              />
              <MetricCard
                label="Alerts"
                value={tenant?.settings.orderReadinessNotificationChannels.length ?? 0}
                hint="Order updates"
                tone="orange"
              />
              <MetricCard
                label="Payment"
                value={manualPaymentMethods.filter((method) => method.active).length}
                hint="Active methods"
                tone="green"
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 3 }} className="admin-settings-card-grid">
              <SettingsOverviewCard
                title="Business Profile"
                description={[
                  tenant?.businessEmail ?? 'No email set',
                  tenant?.businessPhone ?? 'No phone set',
                  tenant?.defaultCurrency ?? 'USD'
                ].join(' | ')}
                badge="Business"
                action="Edit Profile"
                onAction={openBusinessProfile}
              />
              <SettingsOverviewCard
                title="Team Access"
                description={
                  tenant?.delegatedRoleApprovalRequired
                    ? 'New role changes need approval.'
                    : 'Role changes apply right away.'
                }
                badge="Access"
                action="Edit Access"
                onAction={openApprovalRules}
              />
              <SettingsOverviewCard
                title="Notifications"
                description={tenant?.settings.orderReadinessNotificationChannels.join(', ') ?? 'Email'}
                badge="Alerts"
                action="Edit Channels"
                onAction={openNotificationChannels}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2 }} className="admin-settings-ops-grid">
              <SettingsOverviewCard
                title="Delivery Slots"
                description="Keep delivery windows clear for checkout and order planning."
                badge="Delivery"
                action="Edit Profile"
                onAction={openBusinessProfile}
              />
              <SettingsOverviewCard
                title="Kitchen Alerts"
                description="Choose where order updates are sent."
                badge="Alerts"
                action="Edit Channels"
                onAction={openNotificationChannels}
              />
            </SimpleGrid>

            <Paper withBorder p={{ base: 'md', sm: 'lg' }} className="enterprise-panel admin-settings-payment-panel">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Title order={2} size="h3">
                      Manual Payments
                    </Title>
                    <Text size="sm" c="dimmed">
                      Keep payment instructions clear. Receipt uploads are optional.
                    </Text>
                  </div>
                  <Button onClick={openCreateManualMethod}>Add Method</Button>
                </Group>

                {manualPaymentMethods.length === 0 ? (
                  <StateCard
                    title="No payment methods"
                    description="Create one method so customers can pay by bank transfer or another manual option."
                    action={{ label: 'Create Method', onClick: openCreateManualMethod }}
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                      <AdminManualPaymentMethodTable
                        methods={manualPaymentMethods}
                        onEdit={openEditManualMethod}
                        onActivate={modals.openManualActivate}
                        onDeactivate={modals.openManualDeactivate}
                      />
                  </div>
                )}
              </Stack>
            </Paper>
          </>
        )}
      </Stack>

      <AdminBusinessProfileModal
        opened={modals.mode === 'business'}
        loading={mutations.businessProfileMutation.isPending}
        form={businessForm}
        onClose={closeAndReset}
        onSubmit={() => mutations.businessProfileMutation.mutate(toBusinessPayload())}
      />

      <AdminApprovalSettingsModal
        opened={modals.mode === 'approval'}
        loading={mutations.approvalSettingsMutation.isPending}
        form={approvalForm}
        onClose={closeAndReset}
        onSubmit={() =>
          mutations.approvalSettingsMutation.mutate({
            delegatedRoleApprovalRequired: approvalForm.values.delegatedRoleApprovalRequired
          })
        }
      />

      <AdminNotificationChannelsModal
        opened={modals.mode === 'notifications'}
        loading={mutations.notificationSettingsMutation.isPending}
        form={notificationForm}
        onClose={closeAndReset}
        onSubmit={() =>
          mutations.notificationSettingsMutation.mutate({
            orderReadinessNotificationChannels: notificationForm.values.orderReadinessNotificationChannels
          })
        }
      />

      <AdminManualPaymentMethodModal
        mode="create"
        opened={modals.mode === 'manual-create'}
        loading={mutations.createManualMethodMutation.isPending}
        form={manualMethodForm}
        onClose={closeAndReset}
        onSubmit={() => mutations.createManualMethodMutation.mutate(toManualMethodPayload())}
      />

      <AdminManualPaymentMethodModal
        mode="edit"
        opened={modals.mode === 'manual-edit'}
        loading={mutations.updateManualMethodMutation.isPending}
        form={manualMethodForm}
        onClose={closeAndReset}
        onSubmit={() => {
          if (modals.selectedMethod) {
            mutations.updateManualMethodMutation.mutate({
              methodId: modals.selectedMethod.id,
              input: toManualMethodPayload()
            });
          }
        }}
      />

      <AdminSettingsConfirmModal
        opened={modals.mode === 'manual-activate'}
        title="Turn On Method"
        description={`Customers will be able to choose ${modals.selectedMethod?.label ?? 'this method'}.`}
        confirmLabel="Turn On"
        loading={mutations.activateManualMethodMutation.isPending}
        onClose={closeAndReset}
        onConfirm={() => {
          if (modals.selectedMethod) {
            mutations.activateManualMethodMutation.mutate(modals.selectedMethod.id);
          }
        }}
      />

      <AdminSettingsConfirmModal
        opened={modals.mode === 'manual-deactivate'}
        title="Turn Off Method"
        description={`Customers will no longer see ${modals.selectedMethod?.label ?? 'this method'} at checkout.`}
        confirmLabel="Turn Off"
        color="red"
        loading={mutations.deactivateManualMethodMutation.isPending}
        onClose={closeAndReset}
        onConfirm={() => {
          if (modals.selectedMethod) {
            mutations.deactivateManualMethodMutation.mutate(modals.selectedMethod.id);
          }
        }}
      />
    </div>
  );
}

interface SettingsOverviewCardProps {
  title: string;
  description: string;
  badge: string;
  action: string;
  onAction: () => void;
}

function SettingsOverviewCard({
  title,
  description,
  badge,
  action,
  onAction
}: SettingsOverviewCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card className="h-full border-[#312b31] bg-[#1f1d23]">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-black text-[#fff7e8]">{title}</h3>
            <Badge variant="default">{badge}</Badge>
          </div>
          <p className="grow text-sm leading-6 text-[#bca6a7]">
            {description}
          </p>
          <Button variant="secondary" onClick={onAction}>
            {action}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
