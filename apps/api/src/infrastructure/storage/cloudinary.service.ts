import { createHash, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryStorageService {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.config.get<string>('CLOUDINARY_CLOUD_NAME') &&
        this.config.get<string>('CLOUDINARY_API_KEY') &&
        this.config.get<string>('CLOUDINARY_API_SECRET'),
    );
  }

  createSignedUpload(input: { tenantId: string; productId: string; contentType: string }) {
    const cloudName = this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.getOrThrow<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.getOrThrow<string>('CLOUDINARY_API_SECRET');
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = this.createSafeObjectKey(input);
    const folder = `snacks/${input.tenantId}/products/${input.productId}`;
    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(paramsToSign).digest('hex');

    return {
      provider: 'cloudinary' as const,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      fields: {
        api_key: apiKey,
        folder,
        public_id: publicId,
        timestamp,
        signature
      },
      objectKey: `${folder}/${publicId}`,
      expiresInSeconds: 300
    };
  }

  createSignedReceiptUpload(input: { tenantId: string; orderId: string; contentType: string }) {
    const cloudName = this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.getOrThrow<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.getOrThrow<string>('CLOUDINARY_API_SECRET');
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = this.createSafeReceiptObjectKey(input);
    const folder = `snacks/${input.tenantId}/payments/${input.orderId}`;
    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(paramsToSign).digest('hex');

    return {
      provider: 'cloudinary' as const,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      fields: {
        api_key: apiKey,
        folder,
        public_id: publicId,
        timestamp,
        signature
      },
      objectKey: `${folder}/${publicId}`,
      publicUrl: `https://res.cloudinary.com/${cloudName}/image/upload/${folder}/${publicId}`,
      expiresInSeconds: 300
    };
  }

  createSafeObjectKey(input: { tenantId: string; productId: string; contentType: string }) {
    const extension = input.contentType === 'image/png' ? 'png' : input.contentType === 'image/webp' ? 'webp' : 'jpg';
    return `${input.productId}-${randomUUID()}.${extension}`;
  }

  createSafeReceiptObjectKey(input: { orderId: string; contentType: string }) {
    const extension = input.contentType === 'image/png' ? 'png' : input.contentType === 'image/webp' ? 'webp' : 'jpg';
    return `${input.orderId}-${randomUUID()}.${extension}`;
  }
}
