import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { CloudinaryStorageService } from './cloudinary.service.js';
import { R2StorageService } from './r2.service.js';
import { R2_CLIENT } from './storage.tokens.js';

@Global()
@Module({
  providers: [
    {
      provide: R2_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const accountId = config.get<string>('R2_ACCOUNT_ID');
        const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
        return new S3Client({
          region: 'auto',
          ...(accountId
            ? { endpoint: `https://${accountId}.r2.cloudflarestorage.com` }
            : {}),
          ...(accessKeyId && secretAccessKey
            ? { credentials: { accessKeyId, secretAccessKey } }
            : {})
        });
      }
    },
    R2StorageService,
    CloudinaryStorageService
  ],
  exports: [R2StorageService, CloudinaryStorageService]
})
export class StorageModule {}
