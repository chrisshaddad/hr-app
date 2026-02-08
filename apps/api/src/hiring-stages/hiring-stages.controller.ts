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
  ForbiddenException,
} from '@nestjs/common';
import { HiringStagesService } from './hiring-stages.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User } from '@repo/db';
import {
  createHiringStageRequestSchema,
  updateHiringStageRequestSchema,
  reorderHiringStagesRequestSchema,
} from '@repo/contracts';
import type {
  HiringStageListResponse,
  HiringStageItem,
  CreateHiringStageRequest,
  UpdateHiringStageRequest,
  ReorderHiringStagesRequest,
} from '@repo/contracts';

@Controller('hiring-stages')
export class HiringStagesController {
  constructor(private readonly hiringStagesService: HiringStagesService) {}

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
  async findAll(@CurrentUser() user: User): Promise<HiringStageListResponse> {
    return this.hiringStagesService.findAll(this.getOrganizationId(user));
  }

  @Post()
  @Roles('ORG_ADMIN')
  async create(
    @Body(new ZodValidationPipe(createHiringStageRequestSchema))
    dto: CreateHiringStageRequest,
    @CurrentUser() user: User,
  ): Promise<HiringStageItem> {
    return this.hiringStagesService.create(this.getOrganizationId(user), dto);
  }

  @Patch('reorder')
  @Roles('ORG_ADMIN')
  async reorder(
    @Body(new ZodValidationPipe(reorderHiringStagesRequestSchema))
    dto: ReorderHiringStagesRequest,
    @CurrentUser() user: User,
  ): Promise<HiringStageListResponse> {
    return this.hiringStagesService.reorder(this.getOrganizationId(user), dto);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateHiringStageRequestSchema))
    dto: UpdateHiringStageRequest,
    @CurrentUser() user: User,
  ): Promise<HiringStageItem> {
    return this.hiringStagesService.update(
      id,
      this.getOrganizationId(user),
      dto,
    );
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.hiringStagesService.delete(id, this.getOrganizationId(user));
  }
}
