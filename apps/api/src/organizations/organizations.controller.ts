import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  Post,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Roles, CurrentUser, Public } from '../auth/decorators';
import type { User, OrganizationStatus } from '@repo/db';
import type {
  OrganizationListResponse,
  OrganizationDetailResponse,
  OrganizationActionResponse,
} from '@repo/contracts';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  //create org request - open to public
  @Post()
  @Public() // mark this route as public if you have an auth guard
  async createOrganization(@Body() body: { name: string; email: string }) {
    try {
      return await this.organizationsService.createOrganization(body);
    } catch (err) {
      console.error(err);
      throw err; // so Nest logs the full error
    }
  }

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

  @Get(':id')
  @Roles('SUPER_ADMIN')
  async findOne(@Param('id') id: string): Promise<OrganizationDetailResponse> {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: User,
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

//Side notes:
// Any route with @roles or @currentUser() requires login
