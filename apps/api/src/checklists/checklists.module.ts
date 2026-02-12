import { Module } from '@nestjs/common';
import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';

@Module({
  providers: [ChecklistsService],
  controllers: [ChecklistsController],
})
export class ChecklistsModule {}
