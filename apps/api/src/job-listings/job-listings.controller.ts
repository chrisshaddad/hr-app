import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobListingsService } from './job-listings.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User, JobListingStatus } from '@repo/db';
import type {
  JobListingCreateRequest,
  JobListingUpdateRequest,
  JobListingDetailResponse,
  JobListingListResponse,
} from '@repo/contracts';
import {
  jobListingCreateRequestSchema,
  jobListingUpdateRequestSchema,
} from '@repo/contracts';

@ApiTags('job-listings')
@Controller('job-listings')
export class JobListingsController {
  constructor(private readonly jobListingsService: JobListingsService) {}

  @Get()
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'List job listings' })
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: JobListingStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<JobListingListResponse> {
    return this.jobListingsService.findAll(user.organizationId!, {
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Get job listing details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.findOne(id, user.organizationId!);
  }

  @Post()
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(jobListingCreateRequestSchema))
  @ApiOperation({ summary: 'Create job listing' })
  async create(
    @Body() data: JobListingCreateRequest,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.create(user.organizationId!, data, user.id);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @UsePipes(new ZodValidationPipe(jobListingUpdateRequestSchema))
  @ApiOperation({ summary: 'Update job listing' })
  async update(
    @Param('id') id: string,
    @Body() data: JobListingUpdateRequest,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.update(id, user.organizationId!, data);
  }

  @Patch(':id/publish')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Publish job listing' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.publish(id, user.organizationId!);
  }

  @Patch(':id/pause')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Pause job listing' })
  async pause(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.pause(id, user.organizationId!);
  }

  @Patch(':id/close')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Close job listing' })
  async close(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.close(id, user.organizationId!);
  }

  @Patch(':id/archive')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Archive job listing' })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<JobListingDetailResponse> {
    return this.jobListingsService.archive(id, user.organizationId!);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job listing' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.jobListingsService.delete(id, user.organizationId!);
  }

  @Post(':id/members')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add team member to job listing' })
  async addMember(
    @Param('id') id: string,
    @Body()
    body: { memberId: string; canEdit?: boolean; canEvaluate?: boolean },
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.jobListingsService.addMember(
      id,
      user.organizationId!,
      body.memberId,
      body.canEdit ?? false,
      body.canEvaluate ?? true,
    );
  }

  @Delete(':id/members/:memberId')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove team member from job listing' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    // Verify listing exists
    await this.jobListingsService.findOne(id, user.organizationId!);
    return this.jobListingsService.removeMember(id, memberId);
  }
}
