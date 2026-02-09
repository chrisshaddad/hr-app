import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@repo/db';
import { StageCandidatesService } from './stage-candidates.service';

@ApiTags('stage-candidates')
@Controller('stages/:stageId/candidates')
export class StageCandidatesController {
  constructor(
    private readonly stageCandidatesService: StageCandidatesService,
  ) {}

  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'List candidates in a workflow stage' })
  @ApiOkResponse({ description: 'Stage candidates retrieved successfully' })
  async findByStage(
    @Param('stageId') stageId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.stageCandidatesService.findByStage(
      stageId,
      user.organizationId!,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    );
  }

  @Post()
  @Roles('ORG_ADMIN')
  @ApiOperation({
    summary: 'Add a candidate to a workflow stage',
  })
  @ApiOkResponse({ description: 'Candidate added to stage successfully' })
  async addToStage(
    @Param('stageId') stageId: string,
    @Body()
    body: {
      candidateId: string;
      notes?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.stageCandidatesService.addToStage(
      body.candidateId,
      stageId,
      user.organizationId!,
      body.notes,
    );
  }

  @Post('move')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Move a candidate between stages' })
  @ApiOkResponse({ description: 'Candidate moved successfully' })
  async moveToStage(
    @Param('stageId') stageId: string,
    @Body()
    body: {
      candidateId: string;
      toStageId: string;
      notes?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.stageCandidatesService.moveToStage(
      body.candidateId,
      stageId,
      body.toStageId,
      user.organizationId!,
      body.notes,
    );
  }

  @Patch(':candidateId/notes')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Update candidate notes in a stage' })
  @ApiOkResponse({ description: 'Candidate notes updated successfully' })
  async updateNotes(
    @Param('stageId') stageId: string,
    @Param('candidateId') candidateId: string,
    @Body() body: { notes: string },
    @CurrentUser() user: User,
  ) {
    return this.stageCandidatesService.updateNotes(
      candidateId,
      stageId,
      user.organizationId!,
      body.notes,
    );
  }

  @Delete(':candidateId')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Remove a candidate from a stage' })
  @ApiOkResponse({ description: 'Candidate removed from stage successfully' })
  async removeFromStage(
    @Param('stageId') stageId: string,
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.stageCandidatesService.removeFromStage(
      candidateId,
      stageId,
      user.organizationId!,
    );
  }

  @Get(':candidateId/history')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get all workflow stages for a candidate' })
  @ApiOkResponse({
    description: 'Candidate workflow history retrieved successfully',
  })
  async getCandidateHistory(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.stageCandidatesService.findByCandidate(
      candidateId,
      user.organizationId!,
    );
  }
}
