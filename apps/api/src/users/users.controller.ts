import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators';
import type { UsersListResponse } from '@repo/contracts';
import type { User } from '@repo/db';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('organization')
  @ApiOperation({ summary: 'Get all users in the current organization' })
  @ApiOkResponse({ description: 'Users retrieved successfully' })
  async getOrganizationUsers(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<UsersListResponse> {
    if (!user.organizationId) {
      return { users: [], total: 0, page: 1, limit: 20 };
    }
    return this.usersService.findByOrganization(user.organizationId, {
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20,
    });
  }
}
