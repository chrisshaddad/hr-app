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
import { TagsService } from './tags.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User } from '@repo/db';
import {
  createTagRequestSchema,
  updateTagRequestSchema,
} from '@repo/contracts';
import type {
  TagListResponse,
  TagDetailResponse,
  CreateTagRequest,
  UpdateTagRequest,
} from '@repo/contracts';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

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
  async findAll(@CurrentUser() user: User): Promise<TagListResponse> {
    return this.tagsService.findAll(this.getOrganizationId(user));
  }

  @Post()
  @Roles('ORG_ADMIN')
  async create(
    @Body(new ZodValidationPipe(createTagRequestSchema)) dto: CreateTagRequest,
    @CurrentUser() user: User,
  ): Promise<TagDetailResponse> {
    return this.tagsService.create(this.getOrganizationId(user), dto);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTagRequestSchema)) dto: UpdateTagRequest,
    @CurrentUser() user: User,
  ): Promise<TagDetailResponse> {
    return this.tagsService.update(id, this.getOrganizationId(user), dto);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.tagsService.delete(id, this.getOrganizationId(user));
  }
}
