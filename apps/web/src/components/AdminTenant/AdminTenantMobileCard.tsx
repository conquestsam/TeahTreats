'use client';

import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import type { AdminTenantModel } from '@/types/AdminTenant/adminTenantTypes';
import { tenantReadinessChannelsLabel } from '@/types/AdminTenant/adminTenantTypes';

interface AdminTenantMobileCardProps {
  tenant: AdminTenantModel;
  onEdit: (tenant: AdminTenantModel) => void;
  onDeactivate: (tenant: AdminTenantModel) => void;
  onReactivate: (tenant: AdminTenantModel) => void;
}

export function AdminTenantMobileCard({
  tenant,
  onEdit,
  onDeactivate,
  onReactivate
}: AdminTenantMobileCardProps) {
  return (
    <Stack gap="sm" className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={900}>{tenant.name}</Text>
          <Text size="xs" c="dimmed">
            {tenant.slug}
          </Text>
        </div>
        <Badge color={tenant.active ? 'green' : 'gray'} variant="light">
          {tenant.active ? 'Active' : 'Inactive'}
        </Badge>
      </Group>
      <Text size="sm">{tenant.businessEmail ?? 'No business email'}</Text>
      <Text size="xs" c="dimmed">
        {tenant.defaultCurrency} · {tenant.timezone}
      </Text>
      <Group gap={6}>
        <Badge size="sm" color={tenant.delegatedRoleApprovalRequired ? 'orange' : 'gray'} variant="light">
          {tenant.delegatedRoleApprovalRequired ? 'Approval' : 'No approval'}
        </Badge>
        <Badge size="sm" color={tenant.manualPaymentEnabled ? 'green' : 'gray'} variant="light">
          {tenant.manualPaymentEnabled ? 'Manual pay' : 'No manual pay'}
        </Badge>
      </Group>
      <Text size="xs" c="dimmed">
        Ready notice: {tenantReadinessChannelsLabel(tenant)}
      </Text>
      <Group grow>
        <Button variant="light" onClick={() => onEdit(tenant)}>
          Edit
        </Button>
        {tenant.active ? (
          <Button color="red" variant="light" onClick={() => onDeactivate(tenant)}>
            Deactivate
          </Button>
        ) : (
          <Button color="green" variant="light" onClick={() => onReactivate(tenant)}>
            Reactivate
          </Button>
        )}
      </Group>
    </Stack>
  );
}
