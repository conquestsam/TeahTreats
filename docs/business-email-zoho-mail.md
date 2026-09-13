# Business Email Setup With Zoho Mail

This project expects a real business sender for transactional email:

```env
RESEND_FROM_EMAIL=TeshTreats <info@mail.teshtreats.com>
ADMIN_ALERT_EMAIL=admin-or-ops@example.com
```

Use the exact domain after `@` intentionally. If the mailbox should be `info@teshtreats.com`, set up `teshtreats.com`. If the mailbox should be `info@mail.teshtreats.com`, set up the subdomain `mail.teshtreats.com` as the mail domain.

## Zoho Mail Setup

1. Create or sign in to the Zoho Mail organization admin account.
2. Add the business domain in the Zoho Mail Admin Console.
3. Verify domain ownership with one of Zoho's supported methods:
   - TXT record, using the unique `zoho-verification=...` value from Zoho.
   - CNAME record, using the unique `zb...` host and `zmverify.zoho...` target from Zoho.
   - HTML file verification if DNS access is unavailable.
4. Create the mailbox user, for example `info@teshtreats.com` or `info@mail.teshtreats.com`.
5. Add Zoho MX records at the DNS provider that hosts the domain's nameservers:

```txt
Host: @
MX: mx.zoho.com
Priority: 10

Host: @
MX: mx2.zoho.com
Priority: 20

Host: @
MX: mx3.zoho.com
Priority: 50
```

6. Add SPF as a single TXT record. If Zoho Mail is the only email sender for the domain:

```txt
Host: @
TXT: v=spf1 include:zoho.com -all
```

If the same domain also sends transactional mail through Resend, merge providers into one SPF record instead of creating multiple SPF records:

```txt
Host: @
TXT: v=spf1 include:zoho.com include:amazonses.com ~all
```

7. Configure DKIM in Zoho Mail Admin Console and add the generated TXT record to DNS.
8. Add DMARC after SPF and DKIM pass:

```txt
Host: _dmarc
TXT: v=DMARC1; p=none; rua=mailto:admin-or-ops@example.com
```

Move from `p=none` to `p=quarantine` or `p=reject` only after confirming legitimate mail passes SPF/DKIM.

## Resend Setup For App Notifications

Zoho gives the business mailbox inbox. Resend sends app notifications. For Resend to accept `RESEND_FROM_EMAIL`, the sender domain must also be verified in Resend.

1. In Resend, add the same sender domain or subdomain used after `@`.
2. Add the DNS records Resend provides, usually DKIM and return-path records.
3. Wait for Resend to show the domain as verified.
4. Keep `.env` sender syntax exact:

```env
RESEND_FROM_EMAIL=TeshTreats <info@mail.teshtreats.com>
```

5. Restart the API after changing `.env`.
6. Send a smoke test from `/admin/notifications`.

## Verification Checklist

- Zoho domain ownership is verified.
- The mailbox exists and can receive email from an outside account.
- MX records point only to Zoho for that mail domain.
- There is only one SPF TXT record for the domain.
- Zoho DKIM is verified.
- Resend domain is verified.
- `RESEND_FROM_EMAIL` has no leading/trailing spaces and uses `Name <email@example.com>` or `email@example.com`.

Official references:

- [Zoho domain verification](https://www.zoho.com/mail/help/adminconsole/domain-verification.html)
- [Zoho MX record configuration](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html)
- [Zoho SPF configuration](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html)
- [Zoho DKIM configuration](https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html)
