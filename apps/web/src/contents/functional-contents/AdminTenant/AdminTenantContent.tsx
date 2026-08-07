'use client';

import { Button, Group, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { AdminTenantDeactivateModal } from '@/components/functional-components/AdminTenant/AdminTenantDeactivateModal';
import { AdminTenantFormModal } from '@/components/functional-components/AdminTenant/AdminTenantFormModal';

import { AdminTenantReactivateModal } from '@/components/functional-components/AdminTenant/AdminTenantReactivateModal';
import { AdminTenantTable } from '@/components/functional-components/AdminTenant/AdminTenantTable';
import { useAdminTenantForm, useDeactivateTenantForm } from '@/hooks/AdminTenant/useAdminTenantForms';
import { useAdminTenantModals } from '@/hooks/AdminTenant/useAdminTenantModals';
import { useAdminTenantMutations } from '@/hooks/AdminTenant/useAdminTenantMutations';
import { useAdminTenantQuery } from '@/hooks/AdminTenant/useAdminTenantQuery';
import {
  getTenantBusinessAddress,
  getTenantReadinessChannels,
  type AdminTenantInput,
  type AdminTenantModel
} from '@/types/AdminTenant/adminTenantTypes';

export function AdminTenantContent() {
  const tenantsQuery = useAdminTenantQuery();
  const modals = useAdminTenantModals();
  const tenantForm = useAdminTenantForm();
  const deactivateForm = useDeactivateTenantForm();
  const tenants = tenantsQuery.data ?? [];

  const resetAndClose = () => {
    tenantForm.reset();
    deactivateForm.reset();
    modals.closeModal();
  };

  const mutations = useAdminTenantMutations(resetAndClose);

  const openCreate = () => {
    tenantForm.reset();
    modals.openCreate();
  };

  const openEdit = (tenant: AdminTenantModel) => {
    const address = getTenantBusinessAddress(tenant);
    tenantForm.setValues({
      name: tenant.name,
      slug: tenant.slug,
      businessEmail: tenant.businessEmail ?? '',
      businessPhone: tenant.businessPhone ?? '',
      delegatedRoleApprovalRequired: tenant.delegatedRoleApprovalRequired,
      manualPaymentEnabled: tenant.manualPaymentEnabled,
      defaultCurrency: tenant.defaultCurrency,
      timezone: tenant.timezone,
      addressLine1: address.line1 ?? '',
      addressLine2: address.line2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postalCode: address.postalCode ?? '',
      country: address.country ?? 'US',
      orderReadinessNotificationChannels: getTenantReadinessChannels(tenant)
    });
    modals.openEdit(tenant);
  };

  const toPayload = (): AdminTenantInput => ({
    name: tenantForm.values.name,
    slug: tenantForm.values.slug,
    ...(tenantForm.values.businessEmail ? { businessEmail: tenantForm.values.businessEmail } : {}),
    ...(tenantForm.values.businessPhone ? { businessPhone: tenantForm.values.businessPhone } : {}),
    delegatedRoleApprovalRequired: tenantForm.values.delegatedRoleApprovalRequired,
    manualPaymentEnabled: tenantForm.values.manualPaymentEnabled,
    defaultCurrency: tenantForm.values.defaultCurrency,
    timezone: tenantForm.values.timezone,
    businessAddress: {
      ...(tenantForm.values.addressLine1 ? { line1: tenantForm.values.addressLine1 } : {}),
      ...(tenantForm.values.addressLine2 ? { line2: tenantForm.values.addressLine2 } : {}),
      ...(tenantForm.values.city ? { city: tenantForm.values.city } : {}),
      ...(tenantForm.values.state ? { state: tenantForm.values.state } : {}),
      ...(tenantForm.values.postalCode ? { postalCode: tenantForm.values.postalCode } : {}),
      ...(tenantForm.values.country ? { country: tenantForm.values.country } : {})
    },
    orderReadinessNotificationChannels: tenantForm.values.orderReadinessNotificationChannels
  });

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Tenants</Title>
            <Text c="dimmed">Manage store, cafeteria, and vendor tenant settings.</Text>
          </div>
          <Button onClick={openCreate}>Create Tenant</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <MetricCard label="Tenants" value={tenants.length} hint="Visible stores" tone="green" />
          <MetricCard
            label="Active"
            value={tenants.filter((tenant) => tenant.active).length}
            hint="Available for operations"
            tone="blue"
          />
          <MetricCard
            label="Manual Pay"
            value={tenants.filter((tenant) => tenant.manualPaymentEnabled).length}
            hint="Receipt approval enabled"
            tone="orange"
          />
        </SimpleGrid>

        {tenantsQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Skeleton h={120} />
            <Skeleton h={120} />
          </SimpleGrid>
        ) : tenantsQuery.isError ? (
          <StateCard
            title="Tenants unavailable"
            description="Check your session and tenant permissions, then try again."
            tone="warning"
          />
        ) : tenants.length === 0 ? (
          <StateCard title="No tenants yet" description="Create a tenant to manage vendor-owned catalog and stock." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
              <AdminTenantTable
                tenants={tenants}
                onEdit={openEdit}
                onDeactivate={modals.openDeactivate}
                onReactivate={modals.openReactivate}
              />
          </div>
        )}
      </Stack>

      <AdminTenantFormModal
        mode="create"
        opened={modals.mode === 'create'}
        loading={mutations.createTenantMutation.isPending}
        form={tenantForm}
        onClose={resetAndClose}
        onSubmit={() => mutations.createTenantMutation.mutate(toPayload())}
      />

      <AdminTenantFormModal
        mode="edit"
        opened={modals.mode === 'edit'}
        loading={mutations.updateTenantMutation.isPending}
        form={tenantForm}
        onClose={resetAndClose}
        onSubmit={() => {
          if (modals.selectedTenant) {
            mutations.updateTenantMutation.mutate({
              tenantId: modals.selectedTenant.id,
              tenant: toPayload()
            });
          }
        }}
      />

      <AdminTenantDeactivateModal
        opened={modals.mode === 'deactivate'}
        tenantName={modals.selectedTenant?.name}
        loading={mutations.deactivateTenantMutation.isPending}
        form={deactivateForm}
        onClose={resetAndClose}
        onConfirm={() => {
          if (modals.selectedTenant) {
            mutations.deactivateTenantMutation.mutate({
              tenantId: modals.selectedTenant.id,
              input: {
                reason: deactivateForm.values.reason,
                force: deactivateForm.values.force
              }
            });
          }
        }}
      />

      <AdminTenantReactivateModal
        opened={modals.mode === 'reactivate'}
        tenantName={modals.selectedTenant?.name}
        loading={mutations.reactivateTenantMutation.isPending}
        onClose={resetAndClose}
        onConfirm={() => {
          if (modals.selectedTenant) {
            mutations.reactivateTenantMutation.mutate(modals.selectedTenant.id);
          }
        }}
      />
    </div>
  );
}
