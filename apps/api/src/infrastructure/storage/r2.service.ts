import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { S3Client } from '@aws-sdk/client-s3';
import { R2_CLIENT } from './storage.tokens.js';

@Injectable()
export class R2StorageService {
  constructor(
    @Inject(R2_CLIENT) private readonly client: S3Client,
    private readonly config: ConfigService,
  ) {}

  createSignedUploadUrl(key: string, contentType: string) {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.config.getOrThrow<string>('R2_BUCKET'),
        Key: key,
        ContentType: contentType
      }),
      { expiresIn: 300 },
    );
  }

  isConfigured() {
    return Boolean(this.config.get<string>('R2_BUCKET'));
  }

  createSafeObjectKey(input: { tenantId: string; productId: string; contentType: string }) {
    const extension = input.contentType === 'image/png' ? 'png' : input.contentType === 'image/webp' ? 'webp' : 'jpg';
    return `snacks/${input.tenantId}/products/${input.productId}/${randomUUID()}.${extension}`;
  }

  createSafeReceiptObjectKey(input: { tenantId: string; orderId: string; contentType: string }) {
    const extension =
      input.contentType === 'application/pdf'
        ? 'pdf'
        : input.contentType === 'image/png'
          ? 'png'
          : input.contentType === 'image/webp'
            ? 'webp'
            : 'jpg';
    return `snacks/${input.tenantId}/payments/${input.orderId}/${randomUUID()}.${extension}`;
  }

  createPublicUrl(key: string) {
    return `r2://${this.config.get<string>('R2_BUCKET') ?? 'local-bucket'}/${key}`;
  }
}
