import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { User } from '@repo/db';
import { UserRole } from '@repo/db';

import type {
  ListReviewTasksQuery,
  ListReviewCyclesQuery,
  CreateReviewCycleRequest,
  UpdateReviewCycleRequest,
  ListReviewAssignmentsQuery,
  BulkCreateReviewAssignmentsRequest,
  ListAdminReviewsQuery,
  UpsertReviewRequest,
  GetReceivedReviewsQuery,
  ReviewCycleDetailResponse,
  ListReviewCyclesResponse,
  ReviewAssignmentListItem,
  ListReviewAssignmentsResponse,
  BulkCreateReviewAssignmentsResponse,
  ListReviewTasksResponse,
  ReviewFullDtoResponse,
  ListAdminReviewsResponse,
  ListReceivedReviewsResponse,
} from '@repo/contracts';
import {
  listReviewTasksQuerySchema,
  listReviewCyclesQuerySchema,
  createReviewCycleRequestSchema,
  updateReviewCycleRequestSchema,
  listReviewAssignmentsQuerySchema,
  bulkCreateReviewAssignmentsRequestSchema,
  listAdminReviewsQuerySchema,
  upsertReviewRequestSchema,
  getReceivedReviewsQuerySchema,
} from '@repo/contracts';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ==================== Review Cycles Routes ====================

  @Get('cycles')
  @ApiOperation({ summary: 'List review cycles for organization' })
  @ApiOkResponse({ description: 'Review cycles retrieved' })
  async listReviewCycles(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(listReviewCyclesQuerySchema))
    query: ListReviewCyclesQuery,
  ): Promise<ListReviewCyclesResponse> {
    return this.reviewsService.listReviewCycles(user.organizationId!, query);
  }

  @Get('cycles/:id')
  @ApiOperation({ summary: 'Get review cycle details' })
  @ApiOkResponse({ description: 'Review cycle retrieved' })
  async getReviewCycle(
    @CurrentUser() user: User,
    @Param('id') cycleId: string,
  ): Promise<ReviewCycleDetailResponse> {
    const data = await this.reviewsService.getReviewCycle(
      cycleId,
      user.organizationId!,
    );
    return { data };
  }

  @Post('cycles')
  @Roles(UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Create review cycle (ORG_ADMIN only)' })
  @ApiOkResponse({ description: 'Review cycle created' })
  async createReviewCycle(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createReviewCycleRequestSchema))
    dto: CreateReviewCycleRequest,
  ): Promise<ReviewCycleDetailResponse> {
    const data = await this.reviewsService.createReviewCycle(
      user.organizationId!,
      dto,
    );
    return { data };
  }


  @Patch('cycles/:id')
  @Roles(UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Update review cycle (ORG_ADMIN only)' })
  @ApiOkResponse({ description: 'Review cycle updated' })
  async updateReviewCycle(
    @CurrentUser() user: User,
    @Param('id') cycleId: string,
    @Body(new ZodValidationPipe(updateReviewCycleRequestSchema)) dto: UpdateReviewCycleRequest,
  ): Promise<ReviewCycleDetailResponse> {
    const data = await this.reviewsService.updateReviewCycle(
      cycleId,
      user.organizationId!,
      dto,
    );
    return { data };
  }

  // ==================== Review Assignments Routes ====================

  @Get('assignments')
  @ApiOperation({ summary: 'List review assignments' })
  @ApiOkResponse({ description: 'Review assignments retrieved' })
  async listReviewAssignments(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(listReviewAssignmentsQuerySchema))
    query: ListReviewAssignmentsQuery,
  ): Promise<ListReviewAssignmentsResponse> {
    return this.reviewsService.listReviewAssignments(user.organizationId!, user, query);
  }

  @Post('assignments/bulk')
  @Roles(UserRole.ORG_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create review assignments (ORG_ADMIN only)' })
  @ApiOkResponse({ description: 'Review assignments created' })
  async bulkCreateReviewAssignments(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(bulkCreateReviewAssignmentsRequestSchema)) dto: BulkCreateReviewAssignmentsRequest,
  ): Promise<BulkCreateReviewAssignmentsResponse> {
    return this.reviewsService.bulkCreateReviewAssignments(user.organizationId!, dto);
  }

  @Delete('assignments/:id')
  @Roles(UserRole.ORG_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review assignment (ORG_ADMIN only)' })
  async deleteReviewAssignment(
    @CurrentUser() user: User,
    @Param('id') assignmentId: string,
  ): Promise<void> {
    await this.reviewsService.deleteReviewAssignment(assignmentId, user.organizationId!);
  }

  // ==================== My Review Tasks Route ====================

  @Get('my/tasks')
  @ApiOperation({ summary: 'List my review tasks' })
  @ApiOkResponse({ description: 'My review tasks retrieved' })
  async getMyReviewTasks(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(listReviewTasksQuerySchema)) query: ListReviewTasksQuery
  ): Promise<ListReviewTasksResponse> {
    return this.reviewsService.getMyReviewTasks(user.organizationId!, user.id, query);
  }

  // ==================== Reviews Routes ====================

  @Put('by-assignment/:assignmentId')
  @ApiOperation({ summary: 'Upsert review for assignment' })
  @ApiOkResponse({ description: 'Review upserted' })
  async upsertReview(
    @CurrentUser() user: User,
    @Param('assignmentId') assignmentId: string,
    @Body(new ZodValidationPipe(upsertReviewRequestSchema)) dto: UpsertReviewRequest,
  ): Promise<{ data: any }> {
    const data = await this.reviewsService.upsertReview(
      assignmentId,
      user.organizationId!,
      user.id,
      dto,
    );
    return { data };
  }


  // ==================== Admin Reviews Routes ====================

  @Get('admin/all')
  @Roles(UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'List all reviews in organization (ORG_ADMIN only)' })
  @ApiOkResponse({ description: 'Reviews retrieved' })
  async listAdminReviews(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(listAdminReviewsQuerySchema))
    query: ListAdminReviewsQuery,
  ): Promise<ListAdminReviewsResponse> {
    return this.reviewsService.listAdminReviews(user.organizationId!, query);
  }

  // ==================== Received Feedback Routes ====================

  @Get('me/received')
  @ApiOperation({ summary: 'Get feedback received (anonymized PEER reviews)' })
  @ApiOkResponse({ description: 'Received feedback retrieved' })
  async getReceivedReviews(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(getReceivedReviewsQuerySchema))
    query: GetReceivedReviewsQuery,
  ): Promise<ListReceivedReviewsResponse> {
    return this.reviewsService.getReceivedReviews(user.organizationId!, user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review details' })
  @ApiOkResponse({ description: 'Review retrieved' })
  async getReview(
    @CurrentUser() user: User,
    @Param('id') reviewId: string,
  ): Promise<ReviewFullDtoResponse> {
    const data = await this.reviewsService.getReview(reviewId, user.organizationId!, user);
    return { data };
  }
}
