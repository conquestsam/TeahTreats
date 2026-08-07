export interface CustomerAuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  userType: 'customer';
  sessionId: string;
  tenantIds: string[];
}

export interface CustomerOrderSummary {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
  paymentStatus: string | null;
  reservationExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
