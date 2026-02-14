import {
  Get,
  Post,
  Patch,
  Query,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Controller,
  ForbiddenException,
} from '@nestjs/common';
import type { User } from '@repo/db';

import type {
  JobResponse,
  JobListResponse,
  ApplyJobRequest,
  ApplyJobResponse,
  CreateJobRequest,
  UpdateJobStatusRequest,
  JobApplicationsResponse,
  UpdateApplicationStatusRequest,
} from '@repo/contracts';
import {
  createJobRequestSchema,
  applyJobRequestSchema,
  updateJobStatusRequestSchema,
  updateApplicationStatusRequestSchema,
} from '@repo/contracts';
import { JobsService } from './jobs.service';
import { CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Get all jobs by organization id
  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<JobListResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    return this.jobsService.findAll(user.organizationId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  // Get applications for a specific job
  @Get(':jobId/applications')
  @HttpCode(HttpStatus.OK)
  async getJobApplications(
    @Param('jobId') jobId: string,
    @CurrentUser() user: User,
  ): Promise<JobApplicationsResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    return this.jobsService.findApplicationsForJob(jobId, user.organizationId);
  }

  @Patch(':jobId/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('jobId') jobId: string,
    @Body(new ZodValidationPipe(updateJobStatusRequestSchema))
    dto: UpdateJobStatusRequest,
    @CurrentUser() user: User,
  ): Promise<JobResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    return this.jobsService.updateStatus(
      jobId,
      dto.status,
      user.organizationId,
    );
  }

  @Post(':jobId/applications')
  @HttpCode(HttpStatus.CREATED)
  async createJobApplicationInternal(
    @Param('jobId') jobId: string,
    @Body(new ZodValidationPipe(applyJobRequestSchema)) dto: ApplyJobRequest,
    @CurrentUser() user: User,
  ): Promise<ApplyJobResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    return this.jobsService.applyToJobInternal(
      jobId,
      dto,
      user.organizationId,
      user.id,
    );
  }

  // Create job
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createJobRequestSchema)) dto: CreateJobRequest,
    @CurrentUser() user: User,
  ): Promise<JobResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    return this.jobsService.create(dto, user.organizationId);
  }

  @Patch('applications/:applicationId/status')
  @HttpCode(HttpStatus.OK)
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body(new ZodValidationPipe(updateApplicationStatusRequestSchema))
    dto: UpdateApplicationStatusRequest,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    if (!user.id) {
      throw new ForbiddenException('Authenticated user ID is required');
    }

    await this.jobsService.updateApplicationStatus(
      applicationId,
      dto.status,
      user.organizationId,
      user.id,
    );

    return { message: 'Application status updated successfully' };
  }
}
