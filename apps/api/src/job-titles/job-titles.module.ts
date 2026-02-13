import { Module } from '@nestjs/common';
import { JobTitlesService } from './job-titles.service';
import { JobTitlesController } from './job-titles.controller';

@Module({
  controllers: [JobTitlesController],
  providers: [JobTitlesService],
})
export class JobTitlesModule {}
