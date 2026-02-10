import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Roles, CurrentUser } from '../auth/decorators';
import type { OrganizationStatus } from '@repo/db';
import type { AuthenticatedUser } from '../auth/guards/auth.guard';
import type {
  OrganizationListResponse,
  OrganizationDetailResponse,
  OrganizationActionResponse,
} from '@repo/contracts';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  async findAll(
    @Query('status') status?: OrganizationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<OrganizationListResponse> {
    return this.organizationsService.findAll({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('branches-and-job-titles')
  @Roles('ORG_ADMIN')
  async getAllBranchesAndJobTitles(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{
    branches: Array<{ id: string; name: string }>;
    jobTitles: string[];
  }> {
    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new Error('Organization ID required');
    }

    return this.organizationsService.getAllBranchesAndJobTitles(organizationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  async findOne(@Param('id') id: string): Promise<OrganizationDetailResponse> {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationActionResponse> {
    const organization = await this.organizationsService.approve(id, user.id);
    return {
      message: 'Organization approved successfully',
      organization,
    };
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN')
  async reject(@Param('id') id: string): Promise<OrganizationActionResponse> {
    const organization = await this.organizationsService.reject(id);
    return {
      message: 'Organization rejected successfully',
      organization,
    };
  }
}
