import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';

@Module({
  providers: [BranchesService],
  controllers: [BranchesController],
})
export class BranchesModule {}
