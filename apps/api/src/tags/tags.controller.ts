import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@repo/db';
import { TagsService } from './tags.service';
import { ZodValidationPipe } from '../common/pipes';
import { tagSchema, type TagSchema } from '@repo/contracts';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'List all tags for organization' })
  @ApiOkResponse({ description: 'Tags retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.tagsService.findAll(user.organizationId!, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }

  @Get('search')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Search tags by name' })
  @ApiOkResponse({ description: 'Tags found successfully' })
  async search(
    @Query('q') query: string,
    @Query('take') take?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.tagsService.search(
      user.organizationId!,
      query,
      take ? parseInt(take) : 10,
    );
  }

  @Get(':id')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get a specific tag' })
  @ApiOkResponse({ description: 'Tag retrieved successfully' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tagsService.findOne(id, user.organizationId!);
  }

  @Post()
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiOkResponse({ description: 'Tag created successfully' })
  async create(
    @Body(new ZodValidationPipe(tagSchema))
    data: TagSchema,
    @CurrentUser() user: User,
  ) {
    return this.tagsService.create(user.organizationId!, {
      name: data.name,
      color: data.color,
      description: data.description,
    });
  }

  @Post('bulk')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Bulk create tags' })
  @ApiOkResponse({ description: 'Tags created with results' })
  async bulkCreate(
    @Body()
    body: {
      tags: Array<{
        name: string;
        color?: string;
        description?: string;
      }>;
    },
    @CurrentUser() user: User,
  ) {
    return this.tagsService.bulkCreate(user.organizationId!, body.tags);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiOkResponse({ description: 'Tag updated successfully' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(tagSchema.partial()))
    data: Partial<TagSchema>,
    @CurrentUser() user: User,
  ) {
    return this.tagsService.update(id, user.organizationId!, {
      name: data.name,
      color: data.color,
      description: data.description,
    });
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiOkResponse({ description: 'Tag deleted successfully' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tagsService.delete(id, user.organizationId!);
  }
}
