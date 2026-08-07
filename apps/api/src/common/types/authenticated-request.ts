export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  userType: 'admin' | 'customer';
  sessionId: string;
  tenantIds: string[];
  permissions: string[];
  mfaRequired?: boolean;
  mfaVerified?: boolean;
}

export interface AuthenticatedRequest {
  id: string;
  user?: AuthenticatedUser;
  tenantId?: string;
}
