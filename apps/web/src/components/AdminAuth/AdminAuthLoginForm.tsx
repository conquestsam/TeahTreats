'use client';

import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { AdminLoginFormValues } from '@/validation/AdminAuth/adminAuthValidation';

interface AdminAuthLoginFormProps {
  form: UseFormReturnType<AdminLoginFormValues>;
  loading: boolean;
  onSubmit: (values: AdminLoginFormValues) => void;
}

const inputClassNames = { input: 'tt-auth-input', label: 'tt-auth-label' };

export function AdminAuthLoginForm({ form, loading, onSubmit }: AdminAuthLoginFormProps) {
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        {form.errors.email || form.errors.password ? (
          <Alert color="red" variant="light">
            Please check your email and password.
          </Alert>
        ) : null}
        <TextInput
          label="Email address"
          placeholder="team@teshtreats.com"
          autoComplete="email"
          {...form.getInputProps('email')}
          classNames={inputClassNames}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          autoComplete="current-password"
          {...form.getInputProps('password')}
          classNames={inputClassNames}
        />
        <Button type="submit" loading={loading} fullWidth className="tt-auth-btn">
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
