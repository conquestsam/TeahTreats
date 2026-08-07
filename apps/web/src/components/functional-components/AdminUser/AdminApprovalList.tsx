import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminApprovalModel } from '@/types/AdminUser/adminUserTypes';

interface AdminApprovalListProps {
  approvals: AdminApprovalModel[];
  onApprove: (approval: AdminApprovalModel) => void;
  onReject: (approval: AdminApprovalModel) => void;
}

export function AdminApprovalList({ approvals, onApprove, onReject }: AdminApprovalListProps) {
  if (approvals.length === 0) {
    return null;
  }

  return (
    <Paper withBorder p="md" className="enterprise-panel">
      <Stack gap="sm">
        <Text fw={700}>Pending Approvals</Text>
        {approvals.map((approval) => (
          <Group key={approval.id} justify="space-between" gap="sm">
            <div>
              <Text size="sm" fw={600}>
                {approval.targetUserName} needs {approval.roleName}
              </Text>
              <Text size="xs" c="dimmed">
                Requested by {approval.requestedByName}
              </Text>
            </div>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => onApprove(approval)}>
                Approve
              </Button>
              <Button size="xs" color="red" variant="light" onClick={() => onReject(approval)}>
                Reject
              </Button>
            </Group>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
