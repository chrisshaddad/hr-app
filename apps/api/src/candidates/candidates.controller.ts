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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { Roles } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type {
  CandidateCreateRequest,
  CandidateUpdateRequest,
  CandidateDetailResponse,
  CandidateListResponse,
} from '@repo/contracts';
import {
  candidateCreateRequestSchema,
  candidateUpdateRequestSchema,
} from '@repo/contracts';

@ApiTags('candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'List candidates' })
  async findAll(
    @Query('jobListingId') jobListingId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<CandidateListResponse> {
    return this.candidatesService.findAll({
      jobListingId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('search')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Search candidates' })
  async search(@Query('q') query: string): Promise<CandidateDetailResponse[]> {
    return this.candidatesService.search(query);
  }

  @Get(':id')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get candidate details' })
  async findOne(@Param('id') id: string): Promise<CandidateDetailResponse> {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(candidateCreateRequestSchema))
  @ApiOperation({ summary: 'Create candidate' })
  async create(
    @Body() data: CandidateCreateRequest,
  ): Promise<CandidateDetailResponse> {
    return this.candidatesService.create(data);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @UsePipes(new ZodValidationPipe(candidateUpdateRequestSchema))
  @ApiOperation({ summary: 'Update candidate' })
  async update(
    @Param('id') id: string,
    @Body() data: CandidateUpdateRequest,
  ): Promise<CandidateDetailResponse> {
    return this.candidatesService.update(id, data);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete candidate' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.candidatesService.delete(id);
  }

  @Post(':id/tags/:tagId')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add tag to candidate' })
  async addTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ): Promise<void> {
    return this.candidatesService.addTag(id, tagId);
  }

  @Delete(':id/tags/:tagId')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove tag from candidate' })
  async removeTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ): Promise<void> {
    return this.candidatesService.removeTag(id, tagId);
  }
}
