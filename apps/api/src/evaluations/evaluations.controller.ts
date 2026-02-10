import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@repo/db';
import { EvaluationsService } from './evaluations.service';
import { ZodValidationPipe } from '../common/pipes';
import { candidateEvaluationSchema } from '@repo/contracts';

@ApiTags('evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get('candidates/:candidateId')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get all evaluations for a candidate' })
  @ApiOkResponse({ description: 'Evaluations retrieved successfully' })
  async findByCandidate(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.evaluationsService.findByCandidate(
      candidateId,
      user.organizationId!,
    );
  }

  @Get('members/:jobListingMemberId')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({
    summary: 'Get all evaluations by a job listing member',
  })
  @ApiOkResponse({ description: 'Evaluations retrieved successfully' })
  async findByMember(
    @Param('jobListingMemberId') jobListingMemberId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.evaluationsService.findByMember(
      jobListingMemberId,
      user.organizationId!,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    );
  }

  @Post()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Create or update an evaluation' })
  @ApiOkResponse({ description: 'Evaluation created/updated successfully' })
  async upsertEvaluation(
    @Body(new ZodValidationPipe(candidateEvaluationSchema))
    body: {
      jobListingMemberId: string;
      workflowStageCandidateId: string;
      candidateId: string;
      rating: number;
      feedback?: string;
      strengths?: string;
      weaknesses?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.evaluationsService.upsertEvaluation(
      body.jobListingMemberId,
      body.workflowStageCandidateId,
      user.organizationId!,
      {
        rating: body.rating,
        feedback: body.feedback,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
      },
    );
  }

  @Get(':candidateId/:workflowStageCandidateId/average')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get average rating for a candidate in a stage' })
  @ApiOkResponse({ description: 'Average rating calculated successfully' })
  async calculateAverageRating(
    @Param('candidateId') candidateId: string,
    @Param('workflowStageCandidateId') workflowStageCandidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.evaluationsService.calculateAverageRating(
      workflowStageCandidateId,
      user.organizationId!,
    );
  }

  @Delete(':evaluationId')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Delete an evaluation' })
  @ApiOkResponse({ description: 'Evaluation deleted successfully' })
  async delete(
    @Param('evaluationId') evaluationId: string,
    @CurrentUser() user: User,
  ) {
    return this.evaluationsService.delete(
      evaluationId,
      user.organizationId!,
      user.id,
    );
  }
}
