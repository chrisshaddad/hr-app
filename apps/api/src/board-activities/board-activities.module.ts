import { Module } from '@nestjs/common';
import { BoardActivitiesService } from './board-activities.service';
import { BoardActivitiesController } from './board-activities.controller';

@Module({
  providers: [BoardActivitiesService],
  controllers: [BoardActivitiesController],
  exports: [BoardActivitiesService],
})
export class BoardActivitiesModule {}
