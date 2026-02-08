import { Module } from '@nestjs/common';
import { HiringStagesService } from './hiring-stages.service';
import { HiringStagesController } from './hiring-stages.controller';

@Module({
  providers: [HiringStagesService],
  controllers: [HiringStagesController],
})
export class HiringStagesModule {}
