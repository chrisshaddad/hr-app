import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes';
import { ChecklistsService } from './checklists.service';
import { Roles, CurrentUser } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/guards/auth.guard';
import {
  templateCreateRequestSchema,
  templateListQuerySchema,
  templateUpdateRequestSchema,
  type Template,
  type TemplateCreateRequest,
  type TemplateListQuery,
  type TemplateListResponse,
  type TemplateUpdateRequest,
} from '@repo/contracts';

@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get('templates')
  @Roles('ORG_ADMIN')
  async listTemplates(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(templateListQuerySchema))
    query: TemplateListQuery,
  ): Promise<TemplateListResponse> {
    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new ForbiddenException(
        'Organization context required. User must be part of an organization.',
      );
    }

    return this.checklistsService.listTemplates({
      organizationId,
      type: query.type,
      page: query.page,
      limit: query.limit,
    });
  }

  @Post('templates')
  @Roles('ORG_ADMIN')
  async createTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(templateCreateRequestSchema))
    body: TemplateCreateRequest,
  ): Promise<Template> {
    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new ForbiddenException(
        'Organization context required. User must be part of an organization.',
      );
    }

    return this.checklistsService.createTemplate({
      organizationId,
      type: body.type,
      name: body.name,
      description: body.description,
    });
  }

  @Get('templates/:id')
  @Roles('ORG_ADMIN')
  async getTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Template> {
    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new ForbiddenException(
        'Organization context required. User must be part of an organization.',
      );
    }

    const template = await this.checklistsService.getTemplate({
      id,
      organizationId,
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  @Delete('templates/:id')
  @Roles('ORG_ADMIN')
  async deleteTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new ForbiddenException(
        'Organization context required. User must be part of an organization.',
      );
    }

    await this.checklistsService.deleteTemplate({
      id,
      organizationId,
    });

    return { message: 'Template deleted successfully' };
  }

  @Patch('templates/:id')
  @Roles('ORG_ADMIN')
  async updateTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(templateUpdateRequestSchema))
    body: TemplateUpdateRequest,
  ): Promise<Template> {
    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new ForbiddenException(
        'Organization context required. User must be part of an organization.',
      );
    }

    return this.checklistsService.updateTemplate({
      id,
      organizationId,
      name: body.name,
      description: body.description,
    });
  }
}
