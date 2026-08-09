import { Injectable, Logger } from "@nestjs/common";
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { ConfigService } from "@nestjs/config";
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly gmailTransporter: nodemailer.Transporter | null;
  private readonly fromEmail: string;


  constructor(config: ConfigService) {
    const resendApiKey = config.get<string>('RESEND_API_KEY');
    this.fromEmail =
      config.get<string>('RESEND_FROM_EMAIL') ||
      config.get<string>('GMAIL_FROM_EMAIL') ||
      'TeahTreats <orders@teah-treats.local>';
    this.resend = resendApiKey ? new Resend(resendApiKey) : null;

    const gmailUser = config.get<string>('GMAIL_USER');
    const gmailPass = config.get<string>('GMAIL_APP_PASSWORD');

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
        return { provider: 'resend', result };
      } catch (err: any) {
        this.logger.warn(`Resend email delivery failed: ${err.message}. Attempting Gmail fallback...`);
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
}
