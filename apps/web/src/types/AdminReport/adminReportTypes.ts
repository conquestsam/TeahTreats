import type {
  AdminReportsDashboardSummary,
  OrdersByStatusReportItem,
  RepeatCustomerReport,
  RevenueByDayReportItem,
  SalesSummaryReport,
  StockReportItem,
  TopProductReportItem,
  AdminReportDateRangeInput
} from '@snacks/shared';

export type AdminReportsDashboardModel = AdminReportsDashboardSummary;
export type AdminSalesSummaryModel = SalesSummaryReport;
export type AdminRevenueByDayModel = RevenueByDayReportItem;
export type AdminOrdersByStatusModel = OrdersByStatusReportItem;
export type AdminTopProductModel = TopProductReportItem;
export type AdminStockReportItemModel = StockReportItem;
export type AdminRepeatCustomerReportModel = RepeatCustomerReport;
export type { AdminReportDateRangeInput };
