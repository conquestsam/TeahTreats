'use client';

import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import type { AdminTenantModel } from '@/types/AdminTenant/adminTenantTypes';
import { tenantReadinessChannelsLabel } from '@/types/AdminTenant/adminTenantTypes';

interface AdminTenantTableProps {
  tenants: AdminTenantModel[];
  onEdit: (tenant: AdminTenantModel) => void;
  onDeactivate: (tenant: AdminTenantModel) => void;
  onReactivate: (tenant: AdminTenantModel) => void;
}

export function AdminTenantTable({
  tenants,
  onEdit,
  onDeactivate,
  onReactivate
}: AdminTenantTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tenant</Table.Th>
            <Table.Th>Contact</Table.Th>
            <Table.Th>Currency</Table.Th>
            <Table.Th>Settings</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tenants.map((tenant) => (
            <Table.Tr key={tenant.id}>
              <Table.Td>
                <Text fw={800}>{tenant.name}</Text>
                <Text size="xs" c="dimmed">
                  {tenant.slug}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{tenant.businessEmail ?? 'No email'}</Text>
                <Text size="xs" c="dimmed">
                  {tenant.businessPhone ?? 'No phone'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{tenant.defaultCurrency}</Text>
                <Text size="xs" c="dimmed">
                  {tenant.timezone}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap={6}>
                  <Badge size="sm" color={tenant.delegatedRoleApprovalRequired ? 'orange' : 'gray'} variant="light">
                    {tenant.delegatedRoleApprovalRequired ? 'Approval' : 'No approval'}
                  </Badge>
                  <Badge size="sm" color={tenant.manualPaymentEnabled ? 'green' : 'gray'} variant="light">
                    {tenant.manualPaymentEnabled ? 'Manual pay' : 'No manual pay'}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" mt={4}>
                  {tenantReadinessChannelsLabel(tenant)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge color={tenant.active ? 'green' : 'gray'} variant="light">
                  {tenant.active ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <Tooltip label="Edit tenant">
                    <ActionIcon variant="subtle" color="gray" aria-label="Edit tenant" onClick={() => onEdit(tenant)}>
                      E
                    </ActionIcon>
                  </Tooltip>
                  {tenant.active ? (
                    <Tooltip label="Deactivate tenant">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Deactivate tenant"
                        onClick={() => onDeactivate(tenant)}
                      >
                        !
                      </ActionIcon>
                    </Tooltip>
                  ) : (
                    <Tooltip label="Reactivate tenant">
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        aria-label="Reactivate tenant"
                        onClick={() => onReactivate(tenant)}
                      >
                        R
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
