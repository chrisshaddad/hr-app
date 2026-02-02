import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { OrganizationStatus, User } from '@repo/db';
import { OrganizationsService } from './organizations.service';
import { Roles, CurrentUser } from '../auth/decorators';

@ApiTags('organizations')
@ApiCookieAuth('session_id')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all organizations (Super Admin only)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'INACTIVE'],
    description: 'Filter organizations by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiOkResponse({ description: 'List of organizations with pagination info' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Super Admin access required' })
  async findAll(
    @Query('status') status?: OrganizationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.organizationsService.findAll({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get organization details (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiOkResponse({ description: 'Organization details' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Super Admin access required' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve an organization (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiOkResponse({ description: 'Organization approved successfully' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Super Admin access required' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async approve(@Param('id') id: string, @CurrentUser() user: User) {
    const organization = await this.organizationsService.approve(id, user.id);
    return {
      message: 'Organization approved successfully',
      organization,
    };
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Reject an organization (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiOkResponse({ description: 'Organization rejected successfully' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Super Admin access required' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async reject(@Param('id') id: string) {
    const organization = await this.organizationsService.reject(id);
    return {
      message: 'Organization rejected successfully',
      organization,
    };
  }
}
