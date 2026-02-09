import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User } from '@repo/db';
import type {
  BranchCreateRequest,
  BranchUpdateRequest,
  BranchDetailResponse,
  BranchListResponse,
} from '@repo/contracts';
import {
  branchCreateRequestSchema,
  branchUpdateRequestSchema,
} from '@repo/contracts';

@ApiTags('branches')
@Controller('organizations/:orgId/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'List branches in organization' })
  async findAll(
    @Param('orgId') orgId: string,
    @CurrentUser() user: User,
  ): Promise<BranchListResponse> {
    // Verify user belongs to organization
    if (user.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }
    return this.branchesService.findAll(orgId);
  }

  @Get(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Get branch details' })
  async findOne(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<BranchDetailResponse> {
    if (user.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }
    return this.branchesService.findOne(id, orgId);
  }

  @Post()
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(branchCreateRequestSchema))
  @ApiOperation({ summary: 'Create branch' })
  async create(
    @Param('orgId') orgId: string,
    @Body() data: BranchCreateRequest,
    @CurrentUser() user: User,
  ): Promise<BranchDetailResponse> {
    if (user.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }
    return this.branchesService.create(orgId, data);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @UsePipes(new ZodValidationPipe(branchUpdateRequestSchema))
  @ApiOperation({ summary: 'Update branch' })
  async update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() data: BranchUpdateRequest,
    @CurrentUser() user: User,
  ): Promise<BranchDetailResponse> {
    if (user.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }
    return this.branchesService.update(id, orgId, data);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete branch' })
  async delete(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    if (user.organizationId !== orgId) {
      throw new Error('Unauthorized');
    }
    return this.branchesService.delete(id, orgId);
  }
}
