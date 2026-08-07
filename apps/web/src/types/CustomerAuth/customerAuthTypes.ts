import type { CustomerAuthUser } from '@snacks/shared';

export type CustomerUserModel = CustomerAuthUser;

export interface CustomerAuthResponse {
  data: CustomerUserModel;
}

export interface CustomerLoginInput {
  email: string;
  password: string;
}

export interface CustomerSignupInput extends CustomerLoginInput {
  name: string;
  phone: string;
}
