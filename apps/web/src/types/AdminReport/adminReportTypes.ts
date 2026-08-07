import type {
  AdminReportsDashboardSummary,
  OrdersByStatusReportItem,
  RepeatCustomerReport,
  RevenueByDayReportItem,
  SalesSummaryReport,
  StockReportItem,
  TopProductReportItem
} from '@snacks/shared';

export type AdminReportsDashboardModel = AdminReportsDashboardSummary;
export type AdminSalesSummaryModel = SalesSummaryReport;
export type AdminRevenueByDayModel = RevenueByDayReportItem;
export type AdminOrdersByStatusModel = OrdersByStatusReportItem;
export type AdminTopProductModel = TopProductReportItem;
export type AdminStockReportItemModel = StockReportItem;
export type AdminRepeatCustomerReportModel = RepeatCustomerReport;

export interface AdminReportDateRangeInput {
  from?: string;
  to?: string;
}
