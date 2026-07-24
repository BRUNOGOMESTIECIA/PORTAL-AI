import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { validateFileSize, validateMimeType } from './mime-validator';

export interface UploadResult {
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private readonly bucket: string;
  private readonly presignedTtl: number;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get('MINIO_BUCKET', 'portal-uploads');
    this.presignedTtl = config.get<number>('MINIO_PRESIGNED_TTL', 3600);
    this.client = new Minio.Client({
      endPoint: config.get('MINIO_ENDPOINT', 'minio'),
      port: config.get<number>('MINIO_PORT', 9000),
      useSSL: config.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: config.get('MINIO_ROOT_USER', ''),
      secretKey: config.get('MINIO_ROOT_PASSWORD', ''),
    });
  }

  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`MinIO bucket created: ${this.bucket}`);
    }
  }

  async upload(
    tenantSlug: string,
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    validateFileSize(buffer.length);
    validateMimeType(buffer, mimeType, originalFilename);

    const ext = originalFilename.split('.').pop() ?? 'bin';
    const objectKey = `tenants/${tenantSlug}/${uuidv4()}.${ext}`;

    await this.client.putObject(this.bucket, objectKey, buffer, buffer.length, {
      'Content-Type': mimeType,
      'X-Original-Filename': encodeURIComponent(originalFilename),
    });

    return {
      storagePath: objectKey,
      filename: originalFilename,
      mimeType,
      sizeBytes: buffer.length,
    };
  }

  async getPresignedUrl(storagePath: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, storagePath, this.presignedTtl);
  }

  async delete(storagePath: string): Promise<void> {
    await this.client.removeObject(this.bucket, storagePath);
  }
}
