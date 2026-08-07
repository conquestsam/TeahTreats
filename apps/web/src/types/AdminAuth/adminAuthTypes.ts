export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  tenantIds: string[];
  permissions: string[];
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  data: AdminAuthUser;
}
