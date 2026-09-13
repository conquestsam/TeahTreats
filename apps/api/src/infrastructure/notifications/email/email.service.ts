import { Injectable, Logger } from "@nestjs/common";
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { ConfigService } from "@nestjs/config";

type ResendEmailResponse = Awaited<ReturnType<Resend['emails']['send']>>;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly gmailTransporter: nodemailer.Transporter | null;
  private readonly fromEmail: string;


  constructor(config: ConfigService) {
    const resendApiKey = config.get<string>('RESEND_API_KEY');
    const gmailUser = config.get<string>('GMAIL_USER');
    const gmailPass = config.get<string>('GMAIL_APP_PASSWORD');
    this.fromEmail =
      this.string(config.get<string>('RESEND_FROM_EMAIL')) ||
      this.string(config.get<string>('GMAIL_FROM_EMAIL')) ||
      this.string(gmailUser) ||
      'TeshTreats <orders@teshtreats.local>';
    this.resend = resendApiKey ? new Resend(resendApiKey) : null;

    this.gmailTransporter = (gmailUser && gmailPass) ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    }) : null;
  }

  async sendTransactionalEmail(input: { to: string; subject: string; html: string; text?: string }) {
    if (this.resend) {
      try {
        const result = await this.resend.emails.send({
          from: this.fromEmail,
          to: input.to,
          subject: input.subject,
          html: input.html
        });
        this.ensureResendSuccess(result);
        return { provider: 'resend', result };
      } catch (err: any) {
        this.logger.warn(`Resend email delivery failed: ${err.message}. Attempting Gmail fallback...`);
        if (!this.gmailTransporter) {
          throw err;
        }
      }
    }
    if (this.gmailTransporter) {
      try {
        const result = await this.gmailTransporter.sendMail({
          from: this.fromEmail,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
        });
        return { provider: 'gmail', result };
      } catch (err: any) {
        this.logger.error(`Gmail email delivery failed: ${err.message}`);
        throw new Error('Email delivery failed via both Resend and Gmail.');
      }
    }
    throw new Error('No email provider configured.');
  }

  private ensureResendSuccess(result: ResendEmailResponse) {
    if (!result.error) {
      return;
    }

    const status = result.error.statusCode ? ` (${result.error.statusCode})` : '';
    throw new Error(`Resend rejected email: ${result.error.name}${status} - ${result.error.message}`);
  }

  private string(value: string | undefined) {
    return value?.trim() || undefined;
  }
}
