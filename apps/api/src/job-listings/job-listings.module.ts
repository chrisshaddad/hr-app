import { Module } from '@nestjs/common';
import { JobListingsService } from './job-listings.service';
import { JobListingsController } from './job-listings.controller';

@Module({
  providers: [JobListingsService],
  controllers: [JobListingsController],
  exports: [JobListingsService],
})
export class JobListingsModule {}
