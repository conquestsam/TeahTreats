'use client';

import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { AdminAuthLoginForm } from '@/components/functional-components/AdminAuth/AdminAuthLoginForm';
import { TeahTreatsLogo } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsLogo';
import { useAdminAuthForm } from '@/hooks/AdminAuth/useAdminAuthForm';
import { useAdminLoginMutation } from '@/hooks/AdminAuth/useAdminAuthMutations';
import {
  useAdminCsrfQuery,
  useAdminCurrentUserQuery
} from '@/hooks/AdminAuth/useAdminAuthQuery';
import type { AdminLoginFormValues } from '@/validation/AdminAuth/adminAuthValidation';

export function AdminAuthLoginContent() {
  useAdminCsrfQuery();
  const form = useAdminAuthForm();
  const loginMutation = useAdminLoginMutation();
  const currentUserQuery = useAdminCurrentUserQuery();

  useEffect(() => {
    if (currentUserQuery.data) {
      window.location.replace('/admin/dashboard');
    }
  }, [currentUserQuery.data]);

  const submit = (values: AdminLoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Paper p={0} className="enterprise-panel overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(184, 147, 62, 0.2)' }}>
          <div className="flex h-16 items-center justify-between border-b border-[rgba(184,147,62,0.15)] bg-[#1A1A1A] px-6">
            <TeahTreatsLogo />
            <Badge size="sm" styles={{ root: { background: 'rgba(184, 147, 62, 0.15)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)' } }}>
              Admin Suite
            </Badge>
          </div>
          <div className="p-6">
            <Stack gap="lg">
              <Stack gap={4}>
                <Title order={1} size="h2" style={{ color: 'var(--tt-cream)', fontFamily: 'var(--tt-font-editorial)' }}>
                  Admin Sign In
                </Title>
                <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
                  Use your tenant account to access product management and operations.
                </Text>
              </Stack>
              <AdminAuthLoginForm
                form={form}
                loading={loginMutation.isPending}
                onSubmit={submit}
              />
              <Group justify="center">
                <Badge variant="dot" size="xs" styles={{ root: { color: 'var(--tt-cream-dim)' } }}>HTTP-only session</Badge>
                <Badge variant="dot" size="xs" styles={{ root: { color: 'var(--tt-cream-dim)' } }}>CSRF protected</Badge>
              </Group>
            </Stack>
          </div>
        </Paper>
      </motion.div>
    </div>
  );
}


