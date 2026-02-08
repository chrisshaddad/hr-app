import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User, JobStatus } from '@repo/db';
import {
  createJobRequestSchema,
  updateJobRequestSchema,
} from '@repo/contracts';
import type {
  JobListResponse,
  JobDetailResponse,
  CreateJobRequest,
  UpdateJobRequest,
} from '@repo/contracts';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  private getOrganizationId(user: User): string {
    if (!user.organizationId) {
      throw new ForbiddenException(
        'User is not associated with an organization',
      );
    }
    return user.organizationId;
  }

  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: JobStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<JobListResponse> {
    const organizationId = this.getOrganizationId(user);
    return this.jobsService.findAll({
      organizationId,
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<JobDetailResponse> {
    return this.jobsService.findOne(id, this.getOrganizationId(user));
  }

  @Post()
  @Roles('ORG_ADMIN')
  async create(
    @Body(new ZodValidationPipe(createJobRequestSchema)) dto: CreateJobRequest,
    @CurrentUser() user: User,
  ): Promise<JobDetailResponse> {
    return this.jobsService.create(this.getOrganizationId(user), dto);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateJobRequestSchema)) dto: UpdateJobRequest,
    @CurrentUser() user: User,
  ): Promise<JobDetailResponse> {
    return this.jobsService.update(id, this.getOrganizationId(user), dto);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.jobsService.delete(id, this.getOrganizationId(user));
  }
}
