import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import type {
  StorageService,
  UploadedFile,
  UploadOptions,
} from './storage.interface';

@Injectable()
export class MinioStorageService implements StorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('STORAGE_ENDPOINT', 'localhost'),
      port: parseInt(
        this.configService.get<string>('STORAGE_PORT', '9000'),
        10,
      ),
      useSSL: this.configService.get<string>('STORAGE_USE_SSL') === 'true',
      accessKey: this.configService.get<string>(
        'STORAGE_ACCESS_KEY',
        'minioadmin',
      ),
      secretKey: this.configService.get<string>(
        'STORAGE_SECRET_KEY',
        'minioadmin',
      ),
    });

    this.bucket = this.configService.get<string>('STORAGE_BUCKET', 'documents');
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket "${this.bucket}" created`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure bucket exists: ${error}`);
      throw error;
    }
  }

  private generateKey(fileName: string, folder?: string): string {
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = fileName.split('.').pop() || '';
    const safeFileName = `${timestamp}-${randomId}.${extension}`;

    return folder ? `${folder}/${safeFileName}` : safeFileName;
  }

  async upload(file: Buffer, options: UploadOptions): Promise<UploadedFile> {
    const key = this.generateKey(options.fileName, options.folder);

    await this.client.putObject(this.bucket, key, file, file.length, {
      'Content-Type': options.mimeType,
    });

    const endpoint = this.configService.get<string>(
      'STORAGE_ENDPOINT',
      'localhost',
    );
    const port = this.configService.get<string>('STORAGE_PORT', '9000');
    const useSSL = this.configService.get<string>('STORAGE_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';

    const url = `${protocol}://${endpoint}:${port}/${this.bucket}/${key}`;

    this.logger.log(`File uploaded: ${key}`);

    return {
      key,
      url,
      size: file.length,
      mimeType: options.mimeType,
    };
  }

  async download(key: string): Promise<Buffer> {
    const chunks: Buffer[] = [];
    const stream = await this.client.getObject(this.bucket, key);

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
    this.logger.log(`File deleted: ${key}`);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expiresInSeconds);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, key);
      return true;
    } catch {
      return false;
    }
  }
}
