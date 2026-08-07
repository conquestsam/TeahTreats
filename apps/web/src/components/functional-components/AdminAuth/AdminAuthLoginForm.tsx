'use client';

import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { AdminLoginFormValues } from '@/validation/AdminAuth/adminAuthValidation';

interface AdminAuthLoginFormProps {
  form: UseFormReturnType<AdminLoginFormValues>;
  loading: boolean;
  onSubmit: (values: AdminLoginFormValues) => void;
}

export function AdminAuthLoginForm({ form, loading, onSubmit }: AdminAuthLoginFormProps) {
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Email"
          placeholder="admin@snacks.local"
          autoComplete="email"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          autoComplete="current-password"
          {...form.getInputProps('password')}
        />
        <Button type="submit" loading={loading} fullWidth>
          Sign In
        </Button>
      </Stack>
    </form>
  );
}
