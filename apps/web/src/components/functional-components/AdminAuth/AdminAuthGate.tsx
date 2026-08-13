'use client';

import { Container, Loader, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAdminLogoutMutation } from '@/hooks/AdminAuth/useAdminAuthMutations';
import { useAdminCurrentUserQuery } from '@/hooks/AdminAuth/useAdminAuthQuery';
import { useAdminRealtime } from '@/hooks/Realtime/useAdminRealtime';
import { redirectOnce } from '@/lib/auth/auth-errors';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const pathname = usePathname();
  const currentUserQuery = useAdminCurrentUserQuery(pathname !== '/admin/login');
  const logoutMutation = useAdminLogoutMutation();
  useAdminRealtime(pathname !== '/admin/login' && currentUserQuery.isSuccess);

  useEffect(() => {
    if (currentUserQuery.isError) {
      redirectOnce('/admin/login');
    }
  }, [currentUserQuery.isError]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (currentUserQuery.isLoading || currentUserQuery.isError) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="sm">
          <Loader />
          <Text c="dimmed">Checking your session...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      <AdminShell
        userName={currentUserQuery.data?.name}
        signingOut={logoutMutation.isPending}
        onSignOut={() => logoutMutation.mutate()}
      >
        {children}
      </AdminShell>
    </motion.div>
  );
}
