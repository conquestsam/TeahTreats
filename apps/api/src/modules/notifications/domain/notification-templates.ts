import { domainEvents } from '@snacks/shared';

export const notificationTemplateKeys = {
  signup: 'signup',
  orderConfirmation: 'order-confirmation',
  paymentPending: 'payment-pending',
  paymentProofSubmittedAdminAlert: 'payment-proof-submitted-admin-alert',
  paymentApproved: 'payment-approved',
  paymentRejected: 'payment-rejected',
  orderPreparing: 'order-preparing',
  orderReady: 'order-ready',
  orderCompleted: 'order-completed',
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
  orderId?: string;
  amount?: string;
  reason?: string;
  actionUrl?: string;
}

export interface RenderedNotificationTemplate {
  subject: string;
  body: string;
  html: string;
}

type TemplateRenderer = (context: NotificationTemplateContext) => RenderedNotificationTemplate;

function render(subject: string, body: string): RenderedNotificationTemplate {
  return {
    subject,
    body,
    html: `<p>${escapeHtml(body)}</p>`
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
    render(`Welcome to ${context.brandName}`, `Hi ${customer(context)}, your ${context.brandName} account is ready.`),
  [notificationTemplateKeys.orderConfirmation]: (context) =>
    render('Order received', `${order(context)} was received. We will update you as it moves forward.`),
  [notificationTemplateKeys.paymentPending]: (context) =>
    render('Payment pending', `${order(context)} is waiting for payment confirmation.`),
  [notificationTemplateKeys.paymentProofSubmittedAdminAlert]: (context) =>
    render('Payment proof needs review', `${order(context)} has a new manual payment receipt for admin review.`),
  [notificationTemplateKeys.paymentApproved]: (context) =>
    render('Payment approved', `${order(context)} payment was approved. We will start preparing it soon.`),
  [notificationTemplateKeys.paymentRejected]: (context) =>
    render('Payment rejected', `${order(context)} payment was rejected.${context.reason ? ` Reason: ${context.reason}` : ''}`),
  [notificationTemplateKeys.orderPreparing]: (context) =>
    render('Order preparing', `${order(context)} is now being prepared.`),
  [notificationTemplateKeys.orderReady]: (context) =>
    render('Order ready', `${order(context)} is ready for pickup.`),
  [notificationTemplateKeys.orderCompleted]: (context) =>
    render('Order completed', `${order(context)} is complete. Thank you for ordering from ${context.brandName}.`),
  [notificationTemplateKeys.refundPlaceholder]: (context) =>
    render('Refund update', `${order(context)} has a refund update that may need review.`),
  [notificationTemplateKeys.passwordResetPlaceholder]: (context) =>
    render('Password reset', `A password reset was requested for your ${context.brandName} account.`)
};

export const domainEventNotificationTemplates: Partial<Record<string, NotificationTemplateKey>> = {
  [domainEvents.customerSignedUp]: notificationTemplateKeys.signup,
  [domainEvents.orderCreated]: notificationTemplateKeys.orderConfirmation,
  [domainEvents.orderPaymentPending]: notificationTemplateKeys.paymentPending,
  [domainEvents.manualProofSubmitted]: notificationTemplateKeys.paymentProofSubmittedAdminAlert,
  [domainEvents.manualPaymentProofSubmitted]: notificationTemplateKeys.paymentProofSubmittedAdminAlert,
  [domainEvents.manualProofApproved]: notificationTemplateKeys.paymentApproved,
  [domainEvents.paymentSucceeded]: notificationTemplateKeys.paymentApproved,
  [domainEvents.manualProofRejected]: notificationTemplateKeys.paymentRejected,
  [domainEvents.paymentFailed]: notificationTemplateKeys.paymentRejected,
  [domainEvents.orderPreparing]: notificationTemplateKeys.orderPreparing,
  [domainEvents.orderReadyForPickup]: notificationTemplateKeys.orderReady,
  [domainEvents.orderReadyForPickupDispatch]: notificationTemplateKeys.orderReady,
  [domainEvents.orderCompleted]: notificationTemplateKeys.orderCompleted,
  [domainEvents.customerOrderCompleted]: notificationTemplateKeys.orderCompleted,
  [domainEvents.paymentRefunded]: notificationTemplateKeys.refundPlaceholder
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
