'use client';

import { Button, Group, Modal, PasswordInput, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { AdminMfaSetupModel } from '@/types/AdminSecurity/adminSecurityTypes';

export function AdminMfaModal({
  opened,
  loading,
  setup,
  onClose,
  onVerify
}: {
  opened: boolean;
  loading: boolean;
  setup: AdminMfaSetupModel | null;
  onClose: () => void;
  onVerify: (code: string) => void;
}) {
  const [code, setCode] = useState('');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Admin MFA Device Setup"
      centered
      styles={{
        content: { background: 'var(--tt-surface)', color: 'var(--tt-cream)', border: '1px solid rgba(184, 147, 62, 0.25)' },
        header: { background: 'var(--tt-surface)', color: 'var(--tt-cream)', borderBottom: '1px solid rgba(184, 147, 62, 0.15)' }
      }}
    >
      <Stack gap="md">
        {setup ? (
          <Stack gap="xs" style={{ background: 'var(--tt-black)', padding: 14, borderRadius: 10, border: '1px solid rgba(184, 147, 62, 0.15)' }}>
            <Text size="sm" fw={700} style={{ color: 'var(--tt-gold-light)' }}>
              Authenticator Seed Code
            </Text>
            <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>
              Scan or input secret into Google Authenticator or 1Password:
            </Text>
            <Text size="xs" fw={700} style={{ color: 'var(--tt-cream)', fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 6 }}>
              {setup.secretPreview}
            </Text>
          </Stack>
        ) : (
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
            Initialize MFA device generation first.
          </Text>
        )}

        <PasswordInput
          label="Verification Code"
          placeholder="Enter 6-digit TOTP code"
          value={code}
          onChange={(event) => setCode(event.currentTarget.value)}
          styles={{
            input: { background: 'var(--tt-black)', color: 'var(--tt-cream)', borderColor: 'rgba(184, 147, 62, 0.2)' },
            label: { color: 'var(--tt-cream)', fontWeight: 600 }
          }}
        />

        <Group justify="flex-end" mt="sm">
          <Button
            variant="subtle"
            style={{ color: 'var(--tt-cream-muted)' }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="tt-btn-primary"
            loading={loading}
            disabled={!setup || !code.trim()}
            onClick={() => onVerify(code)}
          >
            Verify & Bind
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
