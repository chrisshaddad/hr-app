import { Module } from '@nestjs/common';

import { JobsService } from './jobs.service';
import { MailModule } from '../mail/mail.module';
import { JobsController } from './jobs.controller';
import { PublicJobsController } from './public-jobs.controller';

@Module({
  imports: [MailModule],
  providers: [JobsService],
  controllers: [JobsController, PublicJobsController],
})
export class JobsModule {}
