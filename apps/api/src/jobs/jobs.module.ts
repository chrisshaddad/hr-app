import { Module } from '@nestjs/common';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PublicJobsController } from './public-jobs.controller';

@Module({
  providers: [JobsService],
  controllers: [JobsController, PublicJobsController],
})
export class JobsModule {}
