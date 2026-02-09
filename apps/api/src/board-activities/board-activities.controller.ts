import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@repo/db';
import { BoardActivitiesService } from './board-activities.service';

@ApiTags('board-activities')
@Controller('board-activities')
export class BoardActivitiesController {
  constructor(
    private readonly boardActivitiesService: BoardActivitiesService,
  ) {}

  @Get('job-listings/:jobListingId')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get board activities for a job listing' })
  @ApiOkResponse({ description: 'Activities retrieved successfully' })
  async findByJobListing(
    @Param('jobListingId') jobListingId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.boardActivitiesService.findByJobListing(
      jobListingId,
      user.organizationId!,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    );
  }

  @Get('candidates/:candidateId')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get board activities for a candidate' })
  @ApiOkResponse({ description: 'Activities retrieved successfully' })
  async findByCandidate(
    @Param('candidateId') candidateId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.boardActivitiesService.findByCandidate(
      candidateId,
      user.organizationId!,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    );
  }

  @Get(':id')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiOkResponse({ description: 'Activity retrieved successfully' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardActivitiesService.findOne(id, user.organizationId!);
  }
}
