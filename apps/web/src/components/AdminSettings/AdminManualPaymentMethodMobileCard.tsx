'use client';

import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminManualPaymentMethodModel } from '@/types/AdminSettings/adminSettingsTypes';

interface AdminManualPaymentMethodMobileCardProps {
  method: AdminManualPaymentMethodModel;
  onEdit: (method: AdminManualPaymentMethodModel) => void;
  onActivate: (method: AdminManualPaymentMethodModel) => void;
  onDeactivate: (method: AdminManualPaymentMethodModel) => void;
}

export function AdminManualPaymentMethodMobileCard({
  method,
  onEdit,
  onActivate,
  onDeactivate
}: AdminManualPaymentMethodMobileCardProps) {
  return (
    <Paper withBorder p="md" className="enterprise-panel">
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Text fw={850}>{method.label}</Text>
            <Text size="xs" c="dimmed">
              {method.key}
            </Text>
          </div>
          <Badge color={method.active ? 'green' : 'gray'} variant="light">
            {method.active ? 'Active' : 'Off'}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed" lineClamp={3}>
          {method.instructions}
        </Text>
        <Group gap="xs">
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
      </Stack>
    </Paper>
  );
}
