import type { CustomerAuthUser } from './customer.js';

export interface ApiEnvelope<TData> {
  data: TData;
}

export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  userType: 'admin';
  tenantIds: string[];
  permissions: string[];
  mfaRequired: boolean;
  mfaVerified: boolean;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface CustomerLoginInput {
  email: string;
  password: string;
}

export interface CustomerSignupInput extends CustomerLoginInput {
  name: string;
  phone: string;
}

export type AdminAuthResponse = ApiEnvelope<AdminAuthUser>;
export type CustomerAuthResponse = ApiEnvelope<CustomerAuthUser>;
export type CsrfResponse = ApiEnvelope<{ csrfToken: string }>;
export type LogoutResponse = ApiEnvelope<{ ok: true; revoked?: boolean }>;
