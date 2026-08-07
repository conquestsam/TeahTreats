'use client';

import { Button, Group, Paper, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { AdminAuditLogTable } from '@/components/functional-components/AdminSecurity/AdminAuditLogTable';
import { AdminMfaModal } from '@/components/functional-components/AdminSecurity/AdminMfaModal';
import { AppPageHeader } from '@/components/ui/app-page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { adminAuditKindOptions } from '@/constants/AdminSecurity/adminSecurityConstants';
import { useAdminSecurityMutations } from '@/hooks/AdminSecurity/useAdminSecurityMutations';
import { useAdminAuditLogQuery } from '@/hooks/AdminSecurity/useAdminSecurityQuery';
import type { AdminMfaSetupModel } from '@/types/AdminSecurity/adminSecurityTypes';

export function AdminSecurityContent() {
  const [kind, setKind] = useState('all');
  const [mfaOpened, setMfaOpened] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<AdminMfaSetupModel | null>(null);
  const auditQuery = useAdminAuditLogQuery(kind);
  const mutations = useAdminSecurityMutations(() => setMfaOpened(false));
  const logs = auditQuery.data ?? [];

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AppPageHeader
          eyebrow="Security & Audit"
          title="Security Review"
          description="Review sensitive audit events, actor history, and manage admin MFA authentication setup."
          badge="Enterprise Hardened"
        />

        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <MetricCard label="Audit Logs" value={logs.length} hint="Latest tenant events" tone="blue" />
          <MetricCard label="MFA Guard" value="Enforced" hint="Provider-ready TOTP" tone="green" />
          <MetricCard label="Webhooks" value="Signed" hint="Cryptographic signatures verified" tone="gray" />
        </SimpleGrid>

        <Paper
          p="lg"
          radius="md"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.98))',
            border: '1px solid rgba(184, 147, 62, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <div>
              <Text fw={800} style={{ color: 'var(--tt-cream)', fontSize: '1.1rem' }}>
                Multi-Factor Authentication (MFA)
              </Text>
              <Text size="sm" style={{ color: 'var(--tt-cream-muted)', marginTop: 4 }}>
                Configure Time-Based One-Time Password (TOTP) verification for administrative accounts.
              </Text>
            </div>
            <Button
              className="tt-btn-primary"
              radius="md"
              size="sm"
              onClick={() => {
                mutations.setupMutation.mutate(undefined, {
                  onSuccess: (setup) => {
                    setMfaSetup(setup);
                    setMfaOpened(true);
                  }
                });
              }}
              loading={mutations.setupMutation.isPending}
            >
              Setup MFA Device
            </Button>
          </Group>
        </Paper>

        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <div>
              <Text fw={800} style={{ color: 'var(--tt-cream)', fontSize: '1.1rem' }}>
                System Audit Trail
              </Text>
              <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>
                Immutable event stream for system actions, data mutations, and security checks.
              </Text>
            </div>

            <Select
              placeholder="Filter by event action..."
              value={kind}
              onChange={(value) => setKind(value ?? 'all')}
              data={adminAuditKindOptions}
              size="sm"
              style={{ width: 220 }}
              styles={{
                input: {
                  background: 'var(--tt-black)',
                  color: 'var(--tt-cream)',
                  borderColor: 'rgba(184, 147, 62, 0.2)'
                }
              }}
            />
          </Group>

          {auditQuery.isLoading ? (
            <StateCard loading title="Loading audit logs..." description="Retrieving cryptographically logged system actions." />
          ) : (
            <AdminAuditLogTable logs={logs} />
          )}
        </Stack>
      </Stack>

      <AdminMfaModal
        opened={mfaOpened}
        loading={mutations.verifyMutation.isPending}
        setup={mfaSetup}
        onClose={() => setMfaOpened(false)}
        onVerify={(code) => mutations.verifyMutation.mutate(code)}
      />
    </div>
  );
}
