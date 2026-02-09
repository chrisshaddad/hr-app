import {
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { Public } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';

import type {
  PublicJobResponse,
  ApplyJobRequest,
  ApplyJobResponse,
} from '@repo/contracts';
import { applyJobRequestSchema } from '@repo/contracts';

@Controller('public/jobs')
@Public()
export class PublicJobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Get public job details for apply page
  @Get(':jobId')
  @HttpCode(HttpStatus.OK)
  async getPublicJob(
    @Param('jobId') jobId: string,
  ): Promise<PublicJobResponse> {
    return this.jobsService.findPublicJob(jobId);
  }

  // Apply to a job (public endpoint)
  @Post(':jobId/apply')
  @HttpCode(HttpStatus.CREATED)
  async applyToJob(
    @Param('jobId') jobId: string,
    @Body(new ZodValidationPipe(applyJobRequestSchema)) dto: ApplyJobRequest,
  ): Promise<ApplyJobResponse> {
    return this.jobsService.applyToJob(jobId, dto);
  }
}
