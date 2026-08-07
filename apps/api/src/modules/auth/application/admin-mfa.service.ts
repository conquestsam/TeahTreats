import { BadRequestException, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

@Injectable()
export class AdminMfaService {
  constructor(private readonly prisma: PrismaService) {}

  async setup(userId: string) {
    const secret = this.createBase32Secret();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        adminMfaSecretHash: this.encryptSecret(secret),
        adminMfaVerifiedAt: null
      }
    });
    const issuer = encodeURIComponent(process.env.MFA_ISSUER ?? 'Snacks Commerce');
    const account = encodeURIComponent(`admin:${userId}`);
    return {
      enabled: false,
      setupRequired: true,
      secret,
      otpAuthUrl: `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`,
      note: 'Scan the otpauth URL with an authenticator app, then verify the 6-digit code.'
    };
  }

  async verify(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.adminMfaSecretHash) {
      throw new BadRequestException('MFA setup is required first.');
    }
    if (!this.verifyCode(user.adminMfaSecretHash, code)) {
      throw new BadRequestException('MFA verification failed.');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        adminMfaEnabled: true,
        adminMfaVerifiedAt: new Date()
      }
    });
    return {
      enabled: updated.adminMfaEnabled,
      verifiedAt: updated.adminMfaVerifiedAt?.toISOString() ?? null
    };
  }

  async disable(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.adminMfaSecretHash || !this.verifyCode(user.adminMfaSecretHash, code)) {
      throw new BadRequestException('MFA verification failed.');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        adminMfaEnabled: false,
        adminMfaSecretHash: null,
        adminMfaVerifiedAt: null
      }
    });
    return { enabled: false };
  }

  private verifyCode(encryptedSecret: string, code: string) {
    const normalizedCode = code.trim();
    if (!/^\d{6}$/.test(normalizedCode)) {
      return false;
    }
    const secret = this.decryptSecret(encryptedSecret);
    const now = Math.floor(Date.now() / 1000 / 30);
    return [-1, 0, 1].some((offset) => this.safeEqual(this.generateTotp(secret, now + offset), normalizedCode));
  }

  private generateTotp(secret: string, counter: number) {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    buffer.writeUInt32BE(counter >>> 0, 4);
    const digest = createHmac('sha1', key).update(buffer).digest();
    const lastByte = digest.at(-1);
    if (lastByte === undefined) {
      throw new BadRequestException('MFA verification failed.');
    }
    const offset = lastByte & 0x0f;
    const first = digest[offset];
    const second = digest[offset + 1];
    const third = digest[offset + 2];
    const fourth = digest[offset + 3];
    if (first === undefined || second === undefined || third === undefined || fourth === undefined) {
      throw new BadRequestException('MFA verification failed.');
    }
    const binary =
      ((first & 0x7f) << 24) |
      ((second & 0xff) << 16) |
      ((third & 0xff) << 8) |
      (fourth & 0xff);
    return String(binary % 1_000_000).padStart(6, '0');
  }

  private createBase32Secret() {
    let bits = 0;
    let value = 0;
    let output = '';
    for (const byte of randomBytes(20)) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        output += base32Alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += base32Alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  private base32Decode(value: string) {
    let bits = 0;
    let buffer = 0;
    const bytes: number[] = [];
    for (const character of value.replace(/=+$/g, '').toUpperCase()) {
      const index = base32Alphabet.indexOf(character);
      if (index === -1) {
        throw new BadRequestException('MFA secret is invalid.');
      }
      buffer = (buffer << 5) | index;
      bits += 5;
      if (bits >= 8) {
        bytes.push((buffer >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return Buffer.from(bytes);
  }

  private encryptSecret(secret: string) {
    const key = this.encryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return ['totp-v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
  }

  private decryptSecret(value: string) {
    if (!value.startsWith('totp-v1:')) {
      throw new BadRequestException('MFA setup must be refreshed.');
    }
    const [, iv, tag, encrypted] = value.split(':');
    if (!iv || !tag || !encrypted) {
      throw new BadRequestException('MFA setup must be refreshed.');
    }
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
  }

  private encryptionKey() {
    return createHmac('sha256', process.env.AUTH_ACCESS_TOKEN_SECRET ?? 'dev-access-secret-change-me')
      .update(process.env.MFA_SECRET_ENCRYPTION_KEY ?? 'snacks-commerce-admin-mfa')
      .digest();
  }

  private safeEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
