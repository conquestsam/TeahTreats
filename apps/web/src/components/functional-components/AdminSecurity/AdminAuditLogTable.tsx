import { Badge, Paper, Table, Text } from '@mantine/core';
import type { AdminAuditLogModel } from '@/types/AdminSecurity/adminSecurityTypes';

export function AdminAuditLogTable({ logs }: { logs: AdminAuditLogModel[] }) {
  return (
    <Paper
      withBorder
      style={{
        background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.98))',
        border: '1px solid rgba(184, 147, 62, 0.18)',
        borderRadius: 14,
        overflow: 'hidden'
      }}
    >
      <Table.ScrollContainer minWidth={860}>
        <Table verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead style={{ background: 'rgba(20, 20, 20, 0.95)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Action</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Target</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Actor</Table.Th>
              <Table.Th style={{ color: 'var(--tt-gold-light)', fontWeight: 700 }}>Timestamp</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <Text style={{ color: 'var(--tt-cream-muted)' }} size="sm">No audit logs found for the selected filter.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              logs.map((log) => (
                <Table.Tr key={log.id} style={{ borderBottom: '1px solid rgba(184, 147, 62, 0.1)' }}>
                  <Table.Td>
                    <Badge
                      variant="outline"
                      color="amber"
                      size="sm"
                      styles={{ root: { background: 'rgba(184, 147, 62, 0.12)', color: 'var(--tt-gold-light)', border: '1px solid rgba(184, 147, 62, 0.3)' } }}
                    >
                      {log.action}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ color: 'var(--tt-cream)', fontWeight: 600, fontSize: '0.88rem' }}>{log.target}</Table.Td>
                  <Table.Td style={{ color: 'var(--tt-cream-muted)', fontSize: '0.85rem' }}>{log.actorId ?? 'System Automated'}</Table.Td>
                  <Table.Td style={{ color: 'var(--tt-cream-dim)', fontSize: '0.82rem' }}>{new Date(log.createdAt).toLocaleString()}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
