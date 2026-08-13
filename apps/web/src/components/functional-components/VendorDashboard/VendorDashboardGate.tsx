'use client';

import { Container, Loader, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { VendorShell } from '@/components/layout/vendor-shell';
import { useAdminLogoutMutation } from '@/hooks/AdminAuth/useAdminAuthMutations';
import { useAdminCurrentUserQuery } from '@/hooks/AdminAuth/useAdminAuthQuery';
import { redirectOnce } from '@/lib/auth/auth-errors';

interface VendorDashboardGateProps {
  children: React.ReactNode;
}

export function VendorDashboardGate({ children }: VendorDashboardGateProps) {
  const currentUserQuery = useAdminCurrentUserQuery(true);
  const logoutMutation = useAdminLogoutMutation();

  useEffect(() => {
    if (currentUserQuery.isError) {
      redirectOnce('/admin/login');
    }
  }, [currentUserQuery.isError]);

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
    <VendorShell
      userName={currentUserQuery.data?.name}
      signingOut={logoutMutation.isPending}
      onSignOut={() => logoutMutation.mutate()}
    >
      {children}
    </VendorShell>
  );
}
