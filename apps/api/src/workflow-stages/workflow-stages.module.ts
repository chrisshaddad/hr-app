import { Module } from '@nestjs/common';
import { WorkflowStagesService } from './workflow-stages.service';
import { WorkflowStagesController } from './workflow-stages.controller';

@Module({
  providers: [WorkflowStagesService],
  controllers: [WorkflowStagesController],
  exports: [WorkflowStagesService],
})
export class WorkflowStagesModule {}
