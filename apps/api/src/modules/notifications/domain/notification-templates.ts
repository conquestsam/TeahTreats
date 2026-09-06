import { domainEvents } from '@snacks/shared';
import { renderNotificationEmailHtml } from '../../../infrastructure/notifications/templates/notification-template-design.js';

export const notificationTemplateKeys = {
  signup: 'signup',
  primaryContactVerificationChallenge: 'primary-contact-verification-challenge',
  accountLogin: 'account-login',
  orderConfirmation: 'order-confirmation',
  paymentPending: 'payment-pending',
  paymentProofSubmittedAdminAlert: 'payment-proof-submitted-admin-alert',
  paymentApproved: 'payment-approved',
  paymentRejected: 'payment-rejected',
  paymentRequiresAttention: 'payment-requires-attention',
  orderPreparing: 'order-preparing',
  orderReady: 'order-ready',
  orderCompleted: 'order-completed',
  orderCancelled: 'order-cancelled',
  orderExpired: 'order-expired',
  promotionUpdate: 'promotion-update',
  loyaltyReward: 'loyalty-reward',
  bundlePreview: 'bundle-preview',
  officeSnackPlan: 'office-snack-plan',
  groupCartUpdate: 'group-cart-update',
  tenantUpdate: 'tenant-update',
  settingsUpdate: 'settings-update',
  vendorAccessUpdate: 'vendor-access-update',
  inventoryAlert: 'inventory-alert',
  refundPlaceholder: 'refund-placeholder',
  passwordResetPlaceholder: 'password-reset-placeholder'
} as const;

export type NotificationTemplateKey = (typeof notificationTemplateKeys)[keyof typeof notificationTemplateKeys];

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'in_app';

export interface NotificationTemplateContext {
  brandName: string;
  supportEmail?: string | null;
  supportPhone?: string | null;
  customerName?: string;
  actorName?: string;
  orderId?: string;
  amount?: string;
  reason?: string;
  title?: string;
  message?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface RenderedNotificationTemplate {
  subject: string;
  body: string;
  html: string;
}

type TemplateRenderer = (context: NotificationTemplateContext) => RenderedNotificationTemplate;

function render(subject: string, body: string, context?: NotificationTemplateContext): RenderedNotificationTemplate {
  const emailContext = {
    brandName: context?.brandName ?? 'TeahTreats',
    subject,
    body,
    ...(context?.supportEmail ? { supportEmail: context.supportEmail } : {}),
    ...(context?.supportPhone ? { supportPhone: context.supportPhone } : {}),
    ...(context?.actionUrl ? { actionUrl: context.actionUrl } : {}),
    ...(context?.actionLabel ? { actionLabel: context.actionLabel } : {})
  };
  return {
    subject,
    body,
    html: renderNotificationEmailHtml(emailContext)
  };
}

function customer(context: NotificationTemplateContext) {
  return context.customerName?.trim() || 'there';
}

function order(context: NotificationTemplateContext) {
  return context.orderId ? `Order ${context.orderId}` : 'Your order';
}

export const notificationTemplateRegistry: Record<NotificationTemplateKey, TemplateRenderer> = {
  [notificationTemplateKeys.signup]: (context) =>
    render(`Welcome to ${context.brandName}`, `Hi ${customer(context)}, your ${context.brandName} account is ready.`, context),
  [notificationTemplateKeys.primaryContactVerificationChallenge]: (context) =>
    render('Confirm your contact details', `Hi ${customer(context)}, please confirm your email or phone so we can send order updates to the right place.`, context),
  [notificationTemplateKeys.accountLogin]: (context) =>
    render('Account sign-in', `Hi ${customer(context)}, your ${context.brandName} account was just used to sign in.`, context),
  [notificationTemplateKeys.orderConfirmation]: (context) =>
    render('Order received', `${order(context)} was received. We will update you as it moves forward.`, context),
  [notificationTemplateKeys.paymentPending]: (context) =>
    render('Payment pending', `${order(context)} is waiting for payment confirmation.`, context),
  [notificationTemplateKeys.paymentProofSubmittedAdminAlert]: (context) =>
    render('Payment needs review', `${order(context)} has new payment details to review.${context.amount ? ` Amount: ${context.amount}.` : ''}`, context),
  [notificationTemplateKeys.paymentApproved]: (context) =>
    render('Payment approved', `${order(context)} payment was approved. We will start preparing it soon.`, context),
  [notificationTemplateKeys.paymentRejected]: (context) =>
    render('Payment rejected', `${order(context)} payment was rejected.${context.reason ? ` Reason: ${context.reason}` : ''}`, context),
  [notificationTemplateKeys.paymentRequiresAttention]: (context) =>
    render('Payment needs attention', `${order(context)} has a payment update that needs review.`, context),
  [notificationTemplateKeys.orderPreparing]: (context) =>
    render('Order preparing', `${order(context)} is now being prepared.`, context),
  [notificationTemplateKeys.orderReady]: (context) =>
    render('Order ready', `${order(context)} is ready for pickup.`, context),
  [notificationTemplateKeys.orderCompleted]: (context) =>
    render('Order completed', `${order(context)} is complete. Thank you for ordering from ${context.brandName}.`, context),
  [notificationTemplateKeys.orderCancelled]: (context) =>
    render('Order cancelled', `${order(context)} was cancelled.${context.reason ? ` Reason: ${context.reason}` : ''}`, context),
  [notificationTemplateKeys.orderExpired]: (context) =>
    render('Order expired', `${order(context)} expired because payment was not completed in time.`, context),
  [notificationTemplateKeys.promotionUpdate]: (context) =>
    render(context.title ?? 'New TeahTreats offer', context.message ?? 'A new offer is available for your next snack order.', context),
  [notificationTemplateKeys.loyaltyReward]: (context) =>
    render('Loyalty reward update', context.message ?? 'Your TeahTreats loyalty progress has been updated.', context),
  [notificationTemplateKeys.bundlePreview]: (context) =>
    render('Bundle preview ready', context.message ?? 'Your snack bundle preview is ready to review.', context),
  [notificationTemplateKeys.officeSnackPlan]: (context) =>
    render('Office snack plan ready', context.message ?? 'Your office snack plan is ready to review.', context),
  [notificationTemplateKeys.groupCartUpdate]: (context) =>
    render('Group cart update', context.message ?? 'Your group cart has a new update.', context),
  [notificationTemplateKeys.tenantUpdate]: (context) =>
    render('Store update', context.message ?? 'A store setting was updated.', context),
  [notificationTemplateKeys.settingsUpdate]: (context) =>
    render('Settings updated', context.message ?? 'Store settings were updated.', context),
  [notificationTemplateKeys.vendorAccessUpdate]: (context) =>
    render('Partner access update', context.message ?? 'Partner access was updated.', context),
  [notificationTemplateKeys.inventoryAlert]: (context) =>
    render('Inventory alert', context.message ?? 'Inventory needs review.', context),
  [notificationTemplateKeys.refundPlaceholder]: (context) =>
    render('Refund update', `${order(context)} has a refund update that may need review.`, context),
  [notificationTemplateKeys.passwordResetPlaceholder]: (context) =>
    render('Password reset', `A password reset was requested for your ${context.brandName} account.`, context)
};

export const domainEventNotificationTemplates: Partial<Record<string, NotificationTemplateKey>> = {
  [domainEvents.customerSignedUp]: notificationTemplateKeys.signup,
  [domainEvents.primaryContactVerificationChallenge]: notificationTemplateKeys.primaryContactVerificationChallenge,
  [domainEvents.customerLoggedIn]: notificationTemplateKeys.accountLogin,
  [domainEvents.userLoggedIn]: notificationTemplateKeys.accountLogin,
  [domainEvents.orderCreated]: notificationTemplateKeys.orderConfirmation,
  [domainEvents.orderPaymentPending]: notificationTemplateKeys.paymentPending,
  [domainEvents.manualProofSubmitted]: notificationTemplateKeys.paymentProofSubmittedAdminAlert,
  [domainEvents.manualPaymentProofSubmitted]: notificationTemplateKeys.paymentProofSubmittedAdminAlert,
  [domainEvents.manualProofApproved]: notificationTemplateKeys.paymentApproved,
  [domainEvents.paymentSucceeded]: notificationTemplateKeys.paymentApproved,
  [domainEvents.manualProofRejected]: notificationTemplateKeys.paymentRejected,
  [domainEvents.paymentFailed]: notificationTemplateKeys.paymentRejected,
  [domainEvents.paymentRequiresAttention]: notificationTemplateKeys.paymentRequiresAttention,
  [domainEvents.orderPreparing]: notificationTemplateKeys.orderPreparing,
  [domainEvents.orderReadyForPickup]: notificationTemplateKeys.orderReady,
  [domainEvents.orderReadyForPickupDispatch]: notificationTemplateKeys.orderReady,
  [domainEvents.orderCompleted]: notificationTemplateKeys.orderCompleted,
  [domainEvents.customerOrderCompleted]: notificationTemplateKeys.orderCompleted,
  [domainEvents.orderCancelled]: notificationTemplateKeys.orderCancelled,
  [domainEvents.orderExpired]: notificationTemplateKeys.orderExpired,
  [domainEvents.paymentRefunded]: notificationTemplateKeys.refundPlaceholder,
  [domainEvents.promotionCreated]: notificationTemplateKeys.promotionUpdate,
  [domainEvents.promotionUpdated]: notificationTemplateKeys.promotionUpdate,
  [domainEvents.loyaltyQuestCompleted]: notificationTemplateKeys.loyaltyReward,
  [domainEvents.loyaltyRewardClaimed]: notificationTemplateKeys.loyaltyReward,
  [domainEvents.bundlePreviewGenerated]: notificationTemplateKeys.bundlePreview,
  [domainEvents.snackPlanGenerated]: notificationTemplateKeys.officeSnackPlan,
  [domainEvents.groupCartCreated]: notificationTemplateKeys.groupCartUpdate,
  [domainEvents.groupCartItemAdded]: notificationTemplateKeys.groupCartUpdate,
  [domainEvents.groupCartMerged]: notificationTemplateKeys.groupCartUpdate,
  [domainEvents.tenantCreated]: notificationTemplateKeys.tenantUpdate,
  [domainEvents.tenantUpdated]: notificationTemplateKeys.tenantUpdate,
  [domainEvents.tenantDeactivated]: notificationTemplateKeys.tenantUpdate,
  [domainEvents.tenantReactivated]: notificationTemplateKeys.tenantUpdate,
  [domainEvents.settingsBusinessProfileUpdated]: notificationTemplateKeys.settingsUpdate,
  [domainEvents.settingsApprovalUpdated]: notificationTemplateKeys.settingsUpdate,
  [domainEvents.settingsNotificationChannelsUpdated]: notificationTemplateKeys.settingsUpdate,
  [domainEvents.settingsManualPaymentMethodCreated]: notificationTemplateKeys.settingsUpdate,
  [domainEvents.settingsManualPaymentMethodUpdated]: notificationTemplateKeys.settingsUpdate,
  [domainEvents.settingsManualPaymentMethodStatusChanged]: notificationTemplateKeys.settingsUpdate,
  [domainEvents.vendorAccessChanged]: notificationTemplateKeys.vendorAccessUpdate,
  [domainEvents.inventoryBatchExpired]: notificationTemplateKeys.inventoryAlert,
  [domainEvents.inventoryQuantityAdjusted]: notificationTemplateKeys.inventoryAlert
};
