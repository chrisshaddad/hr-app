import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobTitlesService } from './job-titles.service';
import { Roles } from '../auth/decorators';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import {
  createJobTitleRequestSchema,
  updateJobTitleRequestSchema,
  type CreateJobTitleRequest,
  type UpdateJobTitleRequest,
  type JobTitleResponse,
  type JobTitleListResponse,
} from '@repo/contracts';
import { ZodValidationPipe } from '../common';

@Controller('organizations/:organizationId/job-titles')
@Roles('ORG_ADMIN', 'SUPER_ADMIN')
@UseGuards(OrganizationGuard)
export class JobTitlesController {
  constructor(private readonly jobTitlesService: JobTitlesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createJobTitleRequestSchema))
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createJobTitleRequest: CreateJobTitleRequest,
  ): Promise<JobTitleResponse> {
    return this.jobTitlesService.create(organizationId, createJobTitleRequest);
  }

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<JobTitleListResponse> {
    return this.jobTitlesService.findAll(
      organizationId,
      includeInactive === 'true',
    );
  }

  @Get(':id')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<JobTitleResponse> {
    return this.jobTitlesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateJobTitleRequestSchema))
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateJobTitleRequest: UpdateJobTitleRequest,
  ): Promise<JobTitleResponse> {
    return this.jobTitlesService.update(
      organizationId,
      id,
      updateJobTitleRequest,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.jobTitlesService.remove(organizationId, id);
  }
}
