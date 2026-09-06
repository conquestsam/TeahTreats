'use client';

import { Badge, Button, Group, Paper, Stack, Table, Text } from '@mantine/core';
import type { AdminManualPaymentMethodModel } from '@/types/AdminSettings/adminSettingsTypes';

interface AdminManualPaymentMethodTableProps {
  methods: AdminManualPaymentMethodModel[];
  onEdit: (method: AdminManualPaymentMethodModel) => void;
  onActivate: (method: AdminManualPaymentMethodModel) => void;
  onDeactivate: (method: AdminManualPaymentMethodModel) => void;
}

export function AdminManualPaymentMethodTable({
  methods,
  onEdit,
  onActivate,
  onDeactivate
}: AdminManualPaymentMethodTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden admin-table-panel">
      <Table highlightOnHover verticalSpacing="sm" className="admin-unified-table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Key</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Updated</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {methods.map((method) => (
            <Table.Tr key={method.id}>
              <Table.Td>
                <Stack gap={2}>
                  <Text fw={800}>{method.label}</Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {method.instructions}
                  </Text>
                </Stack>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {method.key}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge color={method.active ? 'green' : 'gray'} variant="light">
                  {method.active ? 'Active' : 'Off'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {new Date(method.updatedAt).toLocaleDateString()}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group justify="flex-end" gap="xs">
                  <Button size="xs" variant="light" onClick={() => onEdit(method)}>
                    Edit
                  </Button>
                  {method.active ? (
                    <Button size="xs" color="red" variant="subtle" onClick={() => onDeactivate(method)}>
                      Turn Off
                    </Button>
                  ) : (
                    <Button size="xs" color="green" variant="subtle" onClick={() => onActivate(method)}>
                      Turn On
                    </Button>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
