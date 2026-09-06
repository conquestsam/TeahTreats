export interface NotificationEmailDesignInput {
  brandName: string;
  subject: string;
  body: string;
  supportEmail?: string | null;
  supportPhone?: string | null;
  actionUrl?: string;
  actionLabel?: string;
}

export function renderNotificationEmailHtml(input: NotificationEmailDesignInput) {
  const brandName = escapeHtml(input.brandName || 'TeahTreats');
  const subject = escapeHtml(input.subject);
  const body = escapeHtml(input.body);
  const supportEmail = input.supportEmail ? escapeHtml(input.supportEmail) : '';
  const supportPhone = input.supportPhone ? escapeHtml(input.supportPhone) : '';
  const actionUrl = input.actionUrl ? escapeHtml(input.actionUrl) : '';
  const actionLabel = escapeHtml(input.actionLabel || 'Open TeahTreats');
  const supportLine = supportEmail || supportPhone
    ? `<p style="margin:18px 0 0;color:#b8aeb0;font-size:13px;line-height:1.6;">Need help? ${supportEmail ? `Email ${supportEmail}` : ''}${supportEmail && supportPhone ? ' or ' : ''}${supportPhone ? `call ${supportPhone}` : ''}.</p>`
    : '';
  const cta = actionUrl
    ? `<a href="${actionUrl}" style="display:inline-block;margin-top:24px;padding:13px 18px;background:#E42C48;color:#fff8f4;text-decoration:none;border-radius:8px;font-weight:800;font-size:14px;">${actionLabel}</a>`
    : '';

  return `
    <div style="margin:0;padding:0;background:#0b0a0d;font-family:Inter,Arial,sans-serif;color:#fff8f4;">
      <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
        <div style="border:1px solid rgba(247,197,103,.24);background:#17151b;border-radius:12px;overflow:hidden;">
          <div style="padding:28px 30px;text-align:center;border-bottom:1px solid rgba(247,197,103,.14);">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#fff8f4;">${brandName}</div>
            <div style="width:44px;height:2px;background:#f7c567;margin:16px auto 0;"></div>
          </div>
          <div style="padding:30px;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.12;color:#fff8f4;font-weight:700;">${subject}</h1>
            <p style="margin:18px 0 0;color:#ead9dc;font-size:15px;line-height:1.75;">${body}</p>
            ${cta}
            ${supportLine}
          </div>
          <div style="padding:18px 30px;background:#111015;border-top:1px solid rgba(247,197,103,.12);">
            <p style="margin:0;color:#8f8487;font-size:12px;line-height:1.6;">This message is about your ${brandName} account or order.</p>
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
