import { domainEvents } from '@snacks/shared';
import { notificationTemplateKeys, type NotificationTemplateKey } from './notification-templates.js';

export const notificationWorkflowKeys = {
  customerLifecycle: 'customer.lifecycle',
  orderLifecycle: 'order.lifecycle',
  paymentReview: 'payment.review',
  adminOperations: 'admin.operations',
  catalogOperations: 'catalog.operations',
  promotionMarketing: 'promotion.marketing',
  loyaltyEngagement: 'loyalty.engagement',
  inventoryOperations: 'inventory.operations',
  inventoryExpiryRisk: 'inventory.expiry-risk'
} as const;

export type NotificationWorkflowKey = (typeof notificationWorkflowKeys)[keyof typeof notificationWorkflowKeys];
export type NotificationRecipientAudience = 'customer' | 'admin';
export type NotificationRequirement = 'mandatory' | 'needed' | 'optional';

export interface NotificationWorkflowDefinition {
  eventName: string;
  workflow: NotificationWorkflowKey;
  module: string;
  action: string;
  audience: NotificationRecipientAudience;
  requirement: NotificationRequirement;
  templateKey: NotificationTemplateKey;
  reason: string;
}

export const notificationWorkflows = [
  {
    eventName: domainEvents.customerSignedUp,
    workflow: notificationWorkflowKeys.customerLifecycle,
    module: 'customer-auth',
    action: 'Customer account created',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.signup,
    reason: 'Confirms account creation and establishes the customer communication channel.'
  },
  {
    eventName: domainEvents.primaryContactVerificationChallenge,
    workflow: notificationWorkflowKeys.customerLifecycle,
    module: 'customer-auth',
    action: 'Primary contact verification requested',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.primaryContactVerificationChallenge,
    reason: 'Customer must verify contact details before reliable order updates can be sent.'
  },
  {
    eventName: domainEvents.customerLoggedIn,
    workflow: notificationWorkflowKeys.customerLifecycle,
    module: 'customer-auth',
    action: 'Customer signed in',
    audience: 'customer',
    requirement: 'optional',
    templateKey: notificationTemplateKeys.accountLogin,
    reason: 'Security feedback for account access; can be disabled by channel settings.'
  },
  {
    eventName: domainEvents.userLoggedIn,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'auth',
    action: 'Admin user signed in',
    audience: 'customer',
    requirement: 'optional',
    templateKey: notificationTemplateKeys.accountLogin,
    reason: 'Security feedback for account access; current template treats this as an account login notice.'
  },
  {
    eventName: domainEvents.orderCreated,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'checkout',
    action: 'Order created',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.orderConfirmation,
    reason: 'Customer needs confirmation that checkout produced an order.'
  },
  {
    eventName: domainEvents.orderPaymentPending,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'payments',
    action: 'Order payment pending',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentPending,
    reason: 'Customer needs payment-state feedback before fulfillment starts.'
  },
  {
    eventName: domainEvents.manualProofSubmitted,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'payments',
    action: 'Manual payment proof submitted',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentProofSubmittedAdminAlert,
    reason: 'Admin must review submitted payment proof to continue the order.'
  },
  {
    eventName: domainEvents.manualPaymentProofSubmitted,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'manual-payments',
    action: 'Manual payment proof submitted',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentProofSubmittedAdminAlert,
    reason: 'Legacy/manual payment event also requires admin review.'
  },
  {
    eventName: domainEvents.manualProofApproved,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'manual-payments',
    action: 'Manual payment approved',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentApproved,
    reason: 'Customer needs confirmation that payment review passed.'
  },
  {
    eventName: domainEvents.paymentSucceeded,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'payments',
    action: 'Payment succeeded',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentApproved,
    reason: 'Customer needs confirmation that payment was accepted.'
  },
  {
    eventName: domainEvents.manualProofRejected,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'manual-payments',
    action: 'Manual payment rejected',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentRejected,
    reason: 'Customer needs a clear rejection notice and reason when available.'
  },
  {
    eventName: domainEvents.paymentFailed,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'payments',
    action: 'Payment failed',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentRejected,
    reason: 'Customer needs failure feedback to retry or choose another payment path.'
  },
  {
    eventName: domainEvents.paymentRequiresAttention,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'payments',
    action: 'Payment requires attention',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.paymentRequiresAttention,
    reason: 'Admin needs an actionable alert for provider or reconciliation exceptions.'
  },
  {
    eventName: domainEvents.orderPreparing,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order preparing',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.orderPreparing,
    reason: 'Customer-facing progress update after admin advances fulfillment.'
  },
  {
    eventName: domainEvents.orderReadyForPickup,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order ready for pickup',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.orderReady,
    reason: 'Customer must know when the order can be collected.'
  },
  {
    eventName: domainEvents.orderReadyForPickupDispatch,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order readiness notification dispatched',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.orderReady,
    reason: 'Explicit readiness-dispatch action requires customer notification feedback.'
  },
  {
    eventName: domainEvents.orderCompleted,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order completed by admin',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.orderCompleted,
    reason: 'Closes the order lifecycle for the customer.'
  },
  {
    eventName: domainEvents.customerOrderCompleted,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order completed by customer',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.orderCompleted,
    reason: 'Confirms customer-driven completion.'
  },
  {
    eventName: domainEvents.orderCancelled,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order cancelled',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.orderCancelled,
    reason: 'Customer needs cancellation feedback and reason when available.'
  },
  {
    eventName: domainEvents.orderExpired,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'orders',
    action: 'Order expired',
    audience: 'customer',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.orderExpired,
    reason: 'Customer needs to know the payment window or reservation expired.'
  },
  {
    eventName: domainEvents.paymentRefunded,
    workflow: notificationWorkflowKeys.paymentReview,
    module: 'payments',
    action: 'Payment refunded',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.refundPlaceholder,
    reason: 'Refunds can require operational review until a fuller refund template exists.'
  },
  {
    eventName: domainEvents.promotionCreated,
    workflow: notificationWorkflowKeys.promotionMarketing,
    module: 'promotions',
    action: 'Promotion created',
    audience: 'customer',
    requirement: 'optional',
    templateKey: notificationTemplateKeys.promotionUpdate,
    reason: 'Marketing notification; should respect tenant notification settings.'
  },
  {
    eventName: domainEvents.promotionUpdated,
    workflow: notificationWorkflowKeys.promotionMarketing,
    module: 'promotions',
    action: 'Promotion updated',
    audience: 'customer',
    requirement: 'optional',
    templateKey: notificationTemplateKeys.promotionUpdate,
    reason: 'Marketing notification; should respect tenant notification settings.'
  },
  {
    eventName: domainEvents.loyaltyQuestCompleted,
    workflow: notificationWorkflowKeys.loyaltyEngagement,
    module: 'loyalty',
    action: 'Loyalty quest completed',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.loyaltyReward,
    reason: 'Customer should receive reward progress feedback.'
  },
  {
    eventName: domainEvents.loyaltyRewardClaimed,
    workflow: notificationWorkflowKeys.loyaltyEngagement,
    module: 'loyalty',
    action: 'Loyalty reward claimed',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.loyaltyReward,
    reason: 'Customer should receive reward claim feedback.'
  },
  {
    eventName: domainEvents.bundlePreviewGenerated,
    workflow: notificationWorkflowKeys.loyaltyEngagement,
    module: 'loyalty',
    action: 'Bundle preview generated',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.bundlePreview,
    reason: 'Customer requested generated output and should know it is ready.'
  },
  {
    eventName: domainEvents.snackPlanGenerated,
    workflow: notificationWorkflowKeys.loyaltyEngagement,
    module: 'loyalty',
    action: 'Office snack plan generated',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.officeSnackPlan,
    reason: 'Customer requested generated output and should know it is ready.'
  },
  {
    eventName: domainEvents.groupCartCreated,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'loyalty',
    action: 'Group cart created',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.groupCartUpdate,
    reason: 'Group cart owner needs feedback for collaborative cart updates.'
  },
  {
    eventName: domainEvents.groupCartItemAdded,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'loyalty',
    action: 'Group cart item added',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.groupCartUpdate,
    reason: 'Group cart owner needs feedback for collaborative cart updates.'
  },
  {
    eventName: domainEvents.groupCartMerged,
    workflow: notificationWorkflowKeys.orderLifecycle,
    module: 'loyalty',
    action: 'Group cart merged',
    audience: 'customer',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.groupCartUpdate,
    reason: 'Group cart owner needs feedback when collaborative selections move to cart.'
  },
  {
    eventName: domainEvents.tenantCreated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-tenants',
    action: 'Tenant created',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.tenantUpdate,
    reason: 'Platform or tenant admin should receive operational feedback for tenant changes.'
  },
  {
    eventName: domainEvents.tenantUpdated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-tenants',
    action: 'Tenant updated',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.tenantUpdate,
    reason: 'Platform or tenant admin should receive operational feedback for tenant changes.'
  },
  {
    eventName: domainEvents.tenantDeactivated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-tenants',
    action: 'Tenant deactivated',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.tenantUpdate,
    reason: 'Deactivation is high-impact and should produce admin feedback.'
  },
  {
    eventName: domainEvents.tenantReactivated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-tenants',
    action: 'Tenant reactivated',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.tenantUpdate,
    reason: 'Reactivation is high-impact and should produce admin feedback.'
  },
  {
    eventName: domainEvents.settingsBusinessProfileUpdated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-settings',
    action: 'Business profile settings updated',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.settingsUpdate,
    reason: 'Admin should receive feedback for business identity/contact changes.'
  },
  {
    eventName: domainEvents.settingsApprovalUpdated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-settings',
    action: 'Approval settings updated',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.settingsUpdate,
    reason: 'Admin should receive feedback for operational approval changes.'
  },
  {
    eventName: domainEvents.settingsNotificationChannelsUpdated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-settings',
    action: 'Notification channels updated',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.settingsUpdate,
    reason: 'Admin should receive feedback when notification routing changes.'
  },
  {
    eventName: domainEvents.settingsManualPaymentMethodCreated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-settings',
    action: 'Manual payment method created',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.settingsUpdate,
    reason: 'Admin should receive feedback for payment instruction changes.'
  },
  {
    eventName: domainEvents.settingsManualPaymentMethodUpdated,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-settings',
    action: 'Manual payment method updated',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.settingsUpdate,
    reason: 'Admin should receive feedback for payment instruction changes.'
  },
  {
    eventName: domainEvents.settingsManualPaymentMethodStatusChanged,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'admin-settings',
    action: 'Manual payment method status changed',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.settingsUpdate,
    reason: 'Admin should receive feedback when payment availability changes.'
  },
  {
    eventName: domainEvents.vendorAccessChanged,
    workflow: notificationWorkflowKeys.adminOperations,
    module: 'vendor',
    action: 'Vendor access changed',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.vendorAccessUpdate,
    reason: 'Admin should receive feedback for partner access changes.'
  },
  {
    eventName: domainEvents.inventoryBatchCreated,
    workflow: notificationWorkflowKeys.inventoryOperations,
    module: 'inventory',
    action: 'Inventory batch created',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.inventoryAlert,
    reason: 'Receiving stock is an operational inventory event that benefits from admin feedback.'
  },
  {
    eventName: domainEvents.inventoryBatchExpiryUpdated,
    workflow: notificationWorkflowKeys.inventoryExpiryRisk,
    module: 'inventory',
    action: 'Inventory batch expiry updated',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.inventoryExpiryUpdated,
    reason: 'Admin changed expiry to prevent a sellable batch from becoming unavailable.'
  },
  {
    eventName: domainEvents.inventoryBatchExpiringSoon,
    workflow: notificationWorkflowKeys.inventoryExpiryRisk,
    module: 'workers',
    action: 'Inventory batch is almost expired',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.inventoryExpiringSoonAdminAlert,
    reason: 'Admin must be warned before perishable inventory becomes unsellable.'
  },
  {
    eventName: domainEvents.inventoryQuantityAdjusted,
    workflow: notificationWorkflowKeys.inventoryOperations,
    module: 'inventory',
    action: 'Inventory quantity adjusted',
    audience: 'admin',
    requirement: 'needed',
    templateKey: notificationTemplateKeys.inventoryAlert,
    reason: 'Stock changes affect sellability and operational availability.'
  },
  {
    eventName: domainEvents.inventoryBatchExpired,
    workflow: notificationWorkflowKeys.inventoryExpiryRisk,
    module: 'inventory',
    action: 'Inventory batch expired',
    audience: 'admin',
    requirement: 'mandatory',
    templateKey: notificationTemplateKeys.inventoryAlert,
    reason: 'Expired inventory is no longer sellable and needs admin awareness.'
  }
] as const satisfies readonly NotificationWorkflowDefinition[];

export const notificationWorkflowByEventName = Object.fromEntries(
  notificationWorkflows.map((workflow) => [workflow.eventName, workflow]),
) as Partial<Record<string, NotificationWorkflowDefinition>>;
