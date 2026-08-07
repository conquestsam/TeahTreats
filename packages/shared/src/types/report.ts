export interface ReportDateRangeSummary {
  from: string;
  to: string;
}

export interface SalesSummaryReport {
  range: ReportDateRangeSummary;
  grossRevenueCents: number;
  netRevenueCents: number;
  discountCents: number;
  orderCount: number;
  paidOrderCount: number;
  averageOrderValueCents: number;
  currency: string;
}

export interface RevenueByDayReportItem {
  date: string;
  revenueCents: number;
  orderCount: number;
}

export interface OrdersByStatusReportItem {
  status: string;
  count: number;
}

export interface TopProductReportItem {
  productName: string;
  skuName: string;
  quantitySold: number;
  revenueCents: number;
}

export interface StockReportItem {
  batchId: string;
  skuId: string;
  skuName: string;
  productName: string;
  quantity: number;
  reserved: number;
  available: number;
  expiresAt: string | null;
}

export interface RepeatCustomerReport {
  repeatCustomerCount: number;
  repeatOrderCount: number;
  knownCustomerCount: number;
}

export interface AdminReportsDashboardSummary {
  salesSummary: SalesSummaryReport;
  revenueByDay: RevenueByDayReportItem[];
  ordersByStatus: OrdersByStatusReportItem[];
  topProducts: TopProductReportItem[];
  lowStock: StockReportItem[];
  expiredStock: StockReportItem[];
  manualPaymentPendingCount: number;
  repeatCustomers: RepeatCustomerReport;
}
