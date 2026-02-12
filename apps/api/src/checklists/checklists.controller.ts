import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes';
import { ChecklistsService } from './checklists.service';
import { Roles, CurrentUser } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/guards/auth.guard';
import {
  templateListQuerySchema,
  type TemplateListQuery,
  type TemplateListResponse,
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
}
