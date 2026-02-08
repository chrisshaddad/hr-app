import {
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Controller,
  ForbiddenException,
} from '@nestjs/common';
import type { User } from '@repo/db';

import { JobsService } from './jobs.service';
import { CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';

import type {
  CreateJobRequest,
  JobResponse,
  JobListResponse,
} from '@repo/contracts';
import { createJobRequestSchema } from '@repo/contracts';

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
}
