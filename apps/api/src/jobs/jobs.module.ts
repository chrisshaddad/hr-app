import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsSchedulerService } from './jobs-scheduler.service';
import { JobsController } from './jobs.controller';

@Module({
  providers: [JobsService, JobsSchedulerService],
  controllers: [JobsController],
})
export class JobsModule {}
