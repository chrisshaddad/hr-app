import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User } from '@repo/db';
import type {
  UserCreateRequest,
  UserUpdateRequest,
  UserListResponse,
  UserResponse,
  UserProfileResponse,
  UserProfileUpdateRequest,
} from '@repo/contracts';
import {
  userCreateRequestSchema,
  userUpdateRequestSchema,
  userProfileUpdateRequestSchema,
} from '@repo/contracts';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'List users in organization' })
  @ApiOkResponse({ description: 'Users retrieved successfully' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('departmentId') departmentId?: string,
  ): Promise<UserListResponse> {
    return this.usersService.findAll(user.organizationId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      departmentId,
    });
  }

  @Get(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Get user details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    return this.usersService.findOne(id, user.organizationId!);
  }

  @Get(':id/profile')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<UserProfileResponse | null> {
    // Verify user exists in organization
    await this.usersService.findOne(id, user.organizationId!);
    return this.usersService.getProfile(id);
  }

  @Post()
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(userCreateRequestSchema))
  @ApiOperation({ summary: 'Create new user' })
  async create(
    @Body() data: UserCreateRequest,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    return this.usersService.create(user.organizationId!, data);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @UsePipes(new ZodValidationPipe(userUpdateRequestSchema))
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() data: UserUpdateRequest,
    @CurrentUser() user: User,
  ): Promise<UserResponse> {
    return this.usersService.update(id, user.organizationId!, data);
  }

  @Patch(':id/profile')
  @Roles('ORG_ADMIN')
  @UsePipes(new ZodValidationPipe(userProfileUpdateRequestSchema))
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Param('id') id: string,
    @Body() data: UserProfileUpdateRequest,
    @CurrentUser() user: User,
  ): Promise<UserProfileResponse> {
    // Verify user exists in organization
    await this.usersService.findOne(id, user.organizationId!);
    return this.usersService.updateProfile(id, data);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.usersService.delete(id, user.organizationId!);
  }
}
