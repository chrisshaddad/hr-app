import { Module } from '@nestjs/common';
import { StageCandidatesService } from './stage-candidates.service';
import { StageCandidatesController } from './stage-candidates.controller';

@Module({
  providers: [StageCandidatesService],
  controllers: [StageCandidatesController],
  exports: [StageCandidatesService],
})
export class StageCandidatesModule {}
