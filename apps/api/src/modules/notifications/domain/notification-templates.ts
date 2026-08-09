import { domainEvents } from '@snacks/shared';

export const notificationTemplateKeys = {
  signup: 'signup',
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
}

export interface RenderedNotificationTemplate {
  subject: string;
  body: string;
  html: string;
}

type TemplateRenderer = (context: NotificationTemplateContext) => RenderedNotificationTemplate;

function render(subject: string, body: string, context?: NotificationTemplateContext): RenderedNotificationTemplate {
  return {
    subject,
    body,
    html: renderEmailHtml(subject, body, context)
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
  [notificationTemplateKeys.accountLogin]: (context) =>
    render('Account sign-in', `Hi ${customer(context)}, your ${context.brandName} account was just used to sign in.`, context),
  [notificationTemplateKeys.orderConfirmation]: (context) =>
    render('Order received', `${order(context)} was received. We will update you as it moves forward.`, context),
  [notificationTemplateKeys.paymentPending]: (context) =>
    render('Payment pending', `${order(context)} is waiting for payment confirmation.`, context),
  [notificationTemplateKeys.paymentProofSubmittedAdminAlert]: (context) =>
    render('Payment proof needs review', `${order(context)} has a new manual payment receipt for admin review.`, context),
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
    render('Tenant update', context.message ?? 'A tenant setting or status was updated.', context),
  [notificationTemplateKeys.settingsUpdate]: (context) =>
    render('Settings updated', context.message ?? 'Store settings were updated.', context),
  [notificationTemplateKeys.vendorAccessUpdate]: (context) =>
    render('Vendor access update', context.message ?? 'Vendor access was updated.', context),
  [notificationTemplateKeys.inventoryAlert]: (context) =>
    render('Inventory alert', context.message ?? 'Inventory needs review.', context),
  [notificationTemplateKeys.refundPlaceholder]: (context) =>
    render('Refund update', `${order(context)} has a refund update that may need review.`, context),
  [notificationTemplateKeys.passwordResetPlaceholder]: (context) =>
    render('Password reset', `A password reset was requested for your ${context.brandName} account.`, context)
};

export const domainEventNotificationTemplates: Partial<Record<string, NotificationTemplateKey>> = {
  [domainEvents.customerSignedUp]: notificationTemplateKeys.signup,
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

function renderEmailHtml(subject: string, body: string, context?: NotificationTemplateContext) {
  const brandName = escapeHtml(context?.brandName ?? 'TeahTreats');
  const safeSubject = escapeHtml(subject);
  const safeBody = escapeHtml(body);
  const supportEmail = context?.supportEmail ? escapeHtml(context.supportEmail) : '';
  const supportPhone = context?.supportPhone ? escapeHtml(context.supportPhone) : '';
  const actionUrl = context?.actionUrl ? escapeHtml(context.actionUrl) : '';
  const supportLine = supportEmail || supportPhone
    ? `<p style="margin:18px 0 0;color:#8f877c;font-size:13px;line-height:1.6;">Need help? ${supportEmail ? `Email ${supportEmail}` : ''}${supportEmail && supportPhone ? ' or ' : ''}${supportPhone ? `call ${supportPhone}` : ''}.</p>`
    : '';
  const cta = actionUrl
    ? `<a href="${actionUrl}" style="display:inline-block;margin-top:24px;padding:12px 18px;background:#9B1B30;color:#FAF7F2;text-decoration:none;border-radius:6px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;">Open TeahTreats</a>`
    : '';

  return `
    <div style="margin:0;padding:0;background:#0A0A0A;font-family:Inter,Arial,sans-serif;color:#FAF7F2;">
      <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
        <div style="border:1px solid rgba(184,147,62,.28);background:#111111;border-radius:10px;overflow:hidden;">
          <div style="padding:24px 28px;border-bottom:1px solid rgba(184,147,62,.18);">
            <div style="font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#B8933E;">${brandName}</div>
            <h1 style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.08;color:#FAF7F2;font-weight:600;">${safeSubject}</h1>
          </div>
          <div style="padding:26px 28px;">
            <p style="margin:0;color:#d8d0c4;font-size:15px;line-height:1.75;">${safeBody}</p>
            ${cta}
            ${supportLine}
          </div>
          <div style="padding:18px 28px;background:#0E0E0E;border-top:1px solid rgba(184,147,62,.12);">
            <p style="margin:0;color:#6f685f;font-size:12px;line-height:1.6;">This message was sent by ${brandName}. If this was not expected, contact store support.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
