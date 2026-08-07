import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio, { type Twilio } from 'twilio';

@Injectable()
export class WhatsappService {
  private readonly client: Twilio | null;
  private readonly from: string | undefined;

  constructor(config: ConfigService) {
    const sid = config.get<string>('TWILIO_ACCOUNT_SID');
    const token = config.get<string>('TWILIO_AUTH_TOKEN');
    this.from = config.get<string>('TWILIO_FROM_WHATSAPP');
    this.client = sid && token ? twilio(sid, token) : null;
  }

  async sendWhatsapp(input: { to: string; body: string }) {
    if (!this.client || !this.from) {
      return { skipped: true, reason: 'Twilio WhatsApp is not configured' };
    }

    return this.client.messages.create({
      from: this.from,
      to: `whatsapp:${input.to}`,
      body: input.body
    });
  }
}
