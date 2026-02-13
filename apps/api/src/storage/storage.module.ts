import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioStorageService } from './minio-storage.service';
import { STORAGE_SERVICE } from './storage.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: MinioStorageService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
