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
import { WorkflowStagesService } from './workflow-stages.service';
import { ZodValidationPipe } from '../common/pipes';
import { workflowStageSchema, type WorkflowStageSchema } from '@repo/contracts';

@ApiTags('workflow-stages')
@Controller('job-listings/:jobListingId/stages')
export class WorkflowStagesController {
  constructor(private readonly workflowStagesService: WorkflowStagesService) {}

  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'List all workflow stages for a job listing' })
  @ApiOkResponse({ description: 'Workflow stages retrieved successfully' })
  async findAll(
    @Param('jobListingId') jobListingId: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.findAll(
      jobListingId,
      user.organizationId!,
    );
  }

  @Get(':id')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get a workflow stage by ID' })
  @ApiOkResponse({ description: 'Workflow stage retrieved successfully' })
  async findOne(
    @Param('jobListingId') jobListingId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.findOne(id, user.organizationId!);
  }

  @Post()
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Create a new workflow stage' })
  @ApiOkResponse({ description: 'Workflow stage created successfully' })
  async create(
    @Param('jobListingId') jobListingId: string,
    @Body(new ZodValidationPipe(workflowStageSchema))
    data: WorkflowStageSchema,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.create(
      jobListingId,
      user.organizationId!,
      {
        name: data.name,
        description: data.description,
        isLocked: data.isLocked,
      },
    );
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Update a workflow stage' })
  @ApiOkResponse({ description: 'Workflow stage updated successfully' })
  async update(
    @Param('jobListingId') jobListingId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(workflowStageSchema.partial()))
    data: Partial<WorkflowStageSchema>,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.update(id, user.organizationId!, {
      name: data.name,
      description: data.description,
      isLocked: data.isLocked,
    });
  }

  @Post(':id/lock')
  @Roles('ORG_ADMIN')
  @ApiOperation({
    summary: 'Lock a workflow stage to prevent candidate movements',
  })
  @ApiOkResponse({ description: 'Workflow stage locked successfully' })
  async lock(
    @Param('jobListingId') jobListingId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.lock(id, user.organizationId!);
  }

  @Post(':id/unlock')
  @Roles('ORG_ADMIN')
  @ApiOperation({
    summary: 'Unlock a workflow stage to allow candidate movements',
  })
  @ApiOkResponse({ description: 'Workflow stage unlocked successfully' })
  async unlock(
    @Param('jobListingId') jobListingId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.unlock(id, user.organizationId!);
  }

  @Post('reorder')
  @Roles('ORG_ADMIN')
  @ApiOperation({
    summary: 'Reorder workflow stages with gap validation',
  })
  @ApiOkResponse({ description: 'Workflow stages reordered successfully' })
  async reorder(
    @Param('jobListingId') jobListingId: string,
    @Body() body: { stages: Array<{ id: string; rank: number }> },
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.reorder(
      jobListingId,
      user.organizationId!,
      body.stages,
    );
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Delete a workflow stage' })
  @ApiOkResponse({ description: 'Workflow stage deleted successfully' })
  async delete(
    @Param('jobListingId') jobListingId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowStagesService.delete(id, user.organizationId!);
  }
}
