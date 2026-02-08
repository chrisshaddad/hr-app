import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole, User, ReviewType } from '@repo/db';
import type {
  ListReviewCyclesQuery,
  CreateReviewCycleRequest,
  UpdateReviewCycleRequest,
  ListReviewAssignmentsQuery,
  BulkCreateReviewAssignmentsRequest,
  ListAdminReviewsQuery,
  UpsertReviewRequest,
  GetReceivedReviewsQuery,
  ReviewCycleDetails,
  ReviewCycleListItem,
  ListReviewCyclesResponse,
  ReviewAssignmentListItem,
  ListReviewAssignmentsResponse,
  BulkCreateReviewAssignmentsResponse,
  ReviewTaskItem,
  ListReviewTasksResponse,
  ReviewFullDto,
  AdminReviewListItem,
  ListAdminReviewsResponse,
  ReceivedReviewDto,
  ListReceivedReviewsResponse,
  ReviewEditableDto,
} from '@repo/contracts';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Review Cycles ====================

  async listReviewCycles(
    organizationId: string,
    query: ListReviewCyclesQuery,
  ): Promise<ListReviewCyclesResponse> {
    const { page, size, activeOnly } = query;
    const now = new Date();

    const where: any = { organizationId };
    if (activeOnly) {
      where.AND = [
        { startDate: { lte: now } },
        { endDate: { gte: now } },
      ];
    }

    const [cycles, total] = await Promise.all([
      this.prisma.reviewCycle.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reviewCycle.count({ where }),
    ]);

    const data: ReviewCycleListItem[] = cycles.map((cycle) => ({
      id: cycle.id,
      name: cycle.name,
      startDate: this.formatDate(cycle.startDate),
      endDate: this.formatDate(cycle.endDate),
      createdAt: this.formatDate(cycle.createdAt),
      updatedAt: this.formatDate(cycle.updatedAt),
    }));

    return {
      data,
      meta: { page, size, total },
    };
  }

  async getReviewCycle(cycleId: string, organizationId: string): Promise<ReviewCycleDetails> {
    const cycle = await this.prisma.reviewCycle.findFirst({
      where: { id: cycleId, organizationId },
    });

    if (!cycle) {
      throw new NotFoundException('Review cycle not found');
    }

    return {
      id: cycle.id,
      name: cycle.name,
      startDate: this.formatDate(cycle.startDate),
      endDate: this.formatDate(cycle.endDate),
      createdAt: this.formatDate(cycle.createdAt),
      updatedAt: this.formatDate(cycle.updatedAt),
    };
  }

  async createReviewCycle(
    organizationId: string,
    dto: CreateReviewCycleRequest,
  ): Promise<ReviewCycleDetails> {
    const cycle = await this.prisma.reviewCycle.create({
      data: {
        organizationId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });

    return {
      id: cycle.id,
      name: cycle.name,
      startDate: this.formatDate(cycle.startDate),
      endDate: this.formatDate(cycle.endDate),
      createdAt: this.formatDate(cycle.createdAt),
      updatedAt: this.formatDate(cycle.updatedAt),
    };
  }

  async updateReviewCycle(
    cycleId: string,
    organizationId: string,
    dto: UpdateReviewCycleRequest,
  ): Promise<ReviewCycleDetails> {
    const cycle = await this.prisma.reviewCycle.findFirst({
      where: { id: cycleId, organizationId },
    });

    if (!cycle) {
      throw new NotFoundException('Review cycle not found');
    }

    const updated = await this.prisma.reviewCycle.update({
      where: { id: cycleId },
      data: {
        name: dto.name ?? cycle.name,
        startDate: dto.startDate ? new Date(dto.startDate) : cycle.startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : cycle.endDate,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      startDate: this.formatDate(updated.startDate),
      endDate: this.formatDate(updated.endDate),
      createdAt: this.formatDate(updated.createdAt),
      updatedAt: this.formatDate(updated.updatedAt),
    };
  }

  // ==================== Review Assignments ====================

  async listReviewAssignments(
    organizationId: string,
    user: User,
    query: ListReviewAssignmentsQuery,
  ): Promise<ListReviewAssignmentsResponse> {
    const { page, size, cycleId, type, revieweeId } = query;
    let { reviewerId } = query;

    // Employees can only see their own assignments
    if (user.role === UserRole.EMPLOYEE) {
      reviewerId = user.id;
    }

    const where: any = { organizationId };
    if (cycleId) where.cycleId = cycleId;
    if (type) where.type = type;
    if (revieweeId) where.revieweeId = revieweeId;
    if (reviewerId) where.reviewerId = reviewerId;

    const [assignments, total] = await Promise.all([
      this.prisma.reviewAssignment.findMany({
        where,
        skip: page * size,
        take: size,
        include: {
          cycle: true,
          reviewer: {
            select: { id: true, name: true, email: true },
          },
          reviewee: {
            select: { id: true, name: true, email: true, departmentId: true },
          },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reviewAssignment.count({ where }),
    ]);

    const data: ReviewAssignmentListItem[] = assignments.map((assignment) => ({
      id: assignment.id,
      cycle: {
        id: assignment.cycle.id,
        name: assignment.cycle.name,
        startDate: this.formatDate(assignment.cycle.startDate),
        endDate: this.formatDate(assignment.cycle.endDate),
        createdAt: this.formatDate(assignment.cycle.createdAt),
        updatedAt: this.formatDate(assignment.cycle.updatedAt),
      },
      type: assignment.type as any,
      reviewer: {
        id: assignment.reviewer.id,
        name: assignment.reviewer.name,
        email: assignment.reviewer.email,
      },
      reviewee: {
        id: assignment.reviewee.id,
        name: assignment.reviewee.name,
        email: assignment.reviewee.email,
        departmentId: assignment.reviewee.departmentId,
      },
      createdAt: this.formatDate(assignment.createdAt),
      updatedAt: this.formatDate(assignment.updatedAt),
      hasReview: !!assignment.review,
    }));

    return {
      data,
      meta: { page, size, total },
    };
  }

  async bulkCreateReviewAssignments(
    organizationId: string,
    dto: BulkCreateReviewAssignmentsRequest,
  ): Promise<BulkCreateReviewAssignmentsResponse> {
    // Verify cycle exists and belongs to org
    const cycle = await this.prisma.reviewCycle.findFirst({
      where: { id: dto.cycleId, organizationId },
    });

    if (!cycle) {
      throw new NotFoundException('Review cycle not found');
    }

    const createdAssignmentIds: string[] = [];
    const warnings: Array<{ code: string; message: string; details?: any }> = [];
    let skippedCount = 0;

    await this.prisma.$transaction(async (tx) => {
      // SELF assignments
      if (dto.self?.enabled && dto.self.revieweeIds.length > 0) {
        for (const revieweeId of dto.self.revieweeIds) {
          // Verify user exists in org
          const user = await tx.user.findFirst({
            where: { id: revieweeId, organizationId },
          });

          if (!user) {
            skippedCount++;
            warnings.push({
              code: 'USER_NOT_FOUND',
              message: `User ${revieweeId} not found in organization`,
              details: { userId: revieweeId },
            });
            continue;
          }

          try {
            const assignment = await tx.reviewAssignment.create({
              data: {
                organizationId,
                cycleId: cycle.id,
                reviewerId: revieweeId,
                revieweeId,
                type: ReviewType.SELF,
              },
            });
            createdAssignmentIds.push(assignment.id);
          } catch (err: any) {
            if (err.code === 'P2002') {
              skippedCount++;
              warnings.push({
                code: 'DUPLICATE_ASSIGNMENT',
                message: `Assignment already exists for this cycle and user`,
                details: { cycleId: cycle.id, revieweeId },
              });
            } else {
              throw err;
            }
          }
        }
      }

      // MANAGER assignments
      if (dto.manager?.enabled && dto.manager.revieweeIds.length > 0) {
        for (const revieweeId of dto.manager.revieweeIds) {
          const user = await tx.user.findFirst({
            where: { id: revieweeId, organizationId },
          });

          if (!user) {
            skippedCount++;
            warnings.push({
              code: 'USER_NOT_FOUND',
              message: `User ${revieweeId} not found in organization`,
              details: { userId: revieweeId },
            });
            continue;
          }

          if (!user.managerId) {
            skippedCount++;
            warnings.push({
              code: 'NO_MANAGER',
              message: `User ${revieweeId} has no manager assigned`,
              details: { userId: revieweeId },
            });
            continue;
          }

          try {
            const assignment = await tx.reviewAssignment.create({
              data: {
                organizationId,
                cycleId: cycle.id,
                reviewerId: user.managerId,
                revieweeId,
                type: ReviewType.MANAGER,
              },
            });
            createdAssignmentIds.push(assignment.id);
          } catch (err: any) {
            if (err.code === 'P2002') {
              skippedCount++;
              warnings.push({
                code: 'DUPLICATE_ASSIGNMENT',
                message: `Assignment already exists for this cycle and user`,
                details: { cycleId: cycle.id, revieweeId },
              });
            } else {
              throw err;
            }
          }
        }
      }

      // PEER assignments
      if (dto.peer?.enabled && dto.peer.pairs.length > 0) {
        for (const pair of dto.peer.pairs) {
          const revieweeUser = await tx.user.findFirst({
            where: { id: pair.revieweeId, organizationId },
          });

          if (!revieweeUser) {
            skippedCount++;
            warnings.push({
              code: 'USER_NOT_FOUND',
              message: `Reviewee ${pair.revieweeId} not found in organization`,
              details: { userId: pair.revieweeId },
            });
            continue;
          }

          for (const reviewerId of pair.reviewerIds) {
            const reviewer = await tx.user.findFirst({
              where: { id: reviewerId, organizationId },
            });

            if (!reviewer) {
              skippedCount++;
              warnings.push({
                code: 'USER_NOT_FOUND',
                message: `Reviewer ${reviewerId} not found in organization`,
                details: { userId: reviewerId },
              });
              continue;
            }

            try {
              const assignment = await tx.reviewAssignment.create({
                data: {
                  organizationId,
                  cycleId: cycle.id,
                  reviewerId,
                  revieweeId: pair.revieweeId,
                  type: ReviewType.PEER,
                },
              });
              createdAssignmentIds.push(assignment.id);
            } catch (err: any) {
              if (err.code === 'P2002') {
                skippedCount++;
                warnings.push({
                  code: 'DUPLICATE_ASSIGNMENT',
                  message: `Assignment already exists`,
                  details: { cycleId: cycle.id, reviewerId, revieweeId: pair.revieweeId },
                });
              } else {
                throw err;
              }
            }
          }
        }
      }
    });

    return {
      data: {
        createdCount: createdAssignmentIds.length,
        skippedCount,
        createdAssignmentIds,
        warnings,
      },
    };
  }

  async deleteReviewAssignment(
    assignmentId: string,
    organizationId: string,
  ): Promise<void> {
    const assignment = await this.prisma.reviewAssignment.findFirst({
      where: { id: assignmentId, organizationId },
    });

    if (!assignment) {
      throw new NotFoundException('Review assignment not found');
    }

    await this.prisma.reviewAssignment.delete({
      where: { id: assignmentId },
    });
  }

  // ==================== Review Tasks (My Tasks) ====================

  async getMyReviewTasks(
    organizationId: string,
    userId: string,
    query: any,
  ): Promise<ListReviewTasksResponse> {
    const { page = 0, size = 20, cycleId, type } = query;

    const where: any = {
      organizationId,
      reviewerId: userId,
    };

    if (cycleId) where.cycleId = cycleId;
    if (type) where.type = type;

    const [assignments, total] = await Promise.all([
      this.prisma.reviewAssignment.findMany({
        where,
        skip: page * size,
        take: size,
        include: {
          cycle: true,
          reviewee: {
            select: { id: true, name: true, email: true },
          },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reviewAssignment.count({ where }),
    ]);

    const data: ReviewTaskItem[] = assignments.map((assignment) => ({
      assignmentId: assignment.id,
      type: assignment.type as any,
      cycle: {
        id: assignment.cycle.id,
        name: assignment.cycle.name,
        startDate: this.formatDate(assignment.cycle.startDate),
        endDate: this.formatDate(assignment.cycle.endDate),
        createdAt: this.formatDate(assignment.cycle.createdAt),
        updatedAt: this.formatDate(assignment.cycle.updatedAt),
      },
      reviewee: {
        id: assignment.reviewee.id,
        name: assignment.reviewee.name,
        email: assignment.reviewee.email,
      },
      review: assignment.review
        ? {
            id: assignment.review.id,
            summary: assignment.review.summary,
            strengths: assignment.review.strengths,
            areasToImprove: assignment.review.areasToImprove,
            accomplishments: assignment.review.accomplishments,
            rating: assignment.review.rating,
            createdAt: this.formatDate(assignment.review.createdAt),
            updatedAt: this.formatDate(assignment.review.updatedAt),
          }
        : null,
    }));

    return {
      data,
      meta: { page, size, total },
    };
  }

  // ==================== Reviews ====================

  async upsertReview(
    assignmentId: string,
    organizationId: string,
    userId: string,
    dto: UpsertReviewRequest,
  ): Promise<ReviewEditableDto> {
    // Get assignment with cycle info
    const assignment = await this.prisma.reviewAssignment.findFirst({
      where: { id: assignmentId, organizationId },
      include: { cycle: true },
    });

    if (!assignment) {
      throw new NotFoundException('Review assignment not found');
    }

    // Verify user is the reviewer
    if (assignment.reviewerId !== userId) {
      throw new ForbiddenException('You are not the assigned reviewer');
    }

    // Check if cycle is within window (unless user is super admin... handled at controller level)
    const now = new Date();
    if (now < assignment.cycle.startDate || now > assignment.cycle.endDate) {
      throw new BadRequestException(
        'Review window is closed. Feedback can only be submitted during the review cycle period.',
      );
    }

    // Upsert review
    const review = await this.prisma.review.upsert({
      where: { assignmentId },
      update: {
        summary: dto.summary,
        strengths: dto.strengths,
        areasToImprove: dto.areasToImprove,
        accomplishments: dto.accomplishments,
        rating: dto.rating,
      },
      create: {
        organizationId,
        cycleId: assignment.cycleId,
        assignmentId,
        reviewerId: assignment.reviewerId,
        revieweeId: assignment.revieweeId,
        type: assignment.type,
        summary: dto.summary,
        strengths: dto.strengths,
        areasToImprove: dto.areasToImprove,
        accomplishments: dto.accomplishments,
        rating: dto.rating,
      },
    });

    return {
      id: review.id,
      summary: review.summary,
      strengths: review.strengths,
      areasToImprove: review.areasToImprove,
      accomplishments: review.accomplishments,
      rating: review.rating,
      createdAt: this.formatDate(review.createdAt),
      updatedAt: this.formatDate(review.updatedAt),
    };
  }

  async getReview(reviewId: string, organizationId: string): Promise<ReviewFullDto> {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, organizationId },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        reviewee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      id: review.id,
      assignmentId: review.assignmentId,
      cycleId: review.cycleId,
      type: review.type as any,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
        email: review.reviewer.email,
      },
      reviewee: {
        id: review.reviewee.id,
        name: review.reviewee.name,
        email: review.reviewee.email,
      },
      summary: review.summary,
      strengths: review.strengths,
      areasToImprove: review.areasToImprove,
      accomplishments: review.accomplishments,
      rating: review.rating,
      createdAt: this.formatDate(review.createdAt),
      updatedAt: this.formatDate(review.updatedAt),
    };
  }

  // ==================== Admin Reviews ====================

  async listAdminReviews(
    organizationId: string,
    query: ListAdminReviewsQuery,
  ): Promise<ListAdminReviewsResponse> {
    const { page, size, cycleId, type, reviewerId, revieweeId } = query;

    const where: any = { organizationId };
    if (cycleId) where.cycleId = cycleId;
    if (type) where.type = type;
    if (reviewerId) where.reviewerId = reviewerId;
    if (revieweeId) where.revieweeId = revieweeId;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: page * size,
        take: size,
        include: {
          reviewer: { select: { id: true, name: true, email: true } },
          reviewee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    const data: AdminReviewListItem[] = reviews.map((review) => ({
      id: review.id,
      assignmentId: review.assignmentId,
      cycleId: review.cycleId,
      type: review.type as any,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
        email: review.reviewer.email,
      },
      reviewee: {
        id: review.reviewee.id,
        name: review.reviewee.name,
        email: review.reviewee.email,
      },
      summary: review.summary,
      strengths: review.strengths,
      areasToImprove: review.areasToImprove,
      accomplishments: review.accomplishments,
      rating: review.rating,
      createdAt: this.formatDate(review.createdAt),
      updatedAt: this.formatDate(review.updatedAt),
    }));

    return {
      data,
      meta: { page, size, total },
    };
  }

  // ==================== Reviewee Received Feedback ====================

  async getReceivedReviews(
    organizationId: string,
    userId: string,
    query: GetReceivedReviewsQuery,
  ): Promise<ListReceivedReviewsResponse> {
    const { cycleId } = query;

    // Get cycle to check if it has ended
    const cycle = await this.prisma.reviewCycle.findFirst({
      where: { id: cycleId, organizationId },
    });

    if (!cycle) {
      throw new NotFoundException('Review cycle not found');
    }

    // Enforce cycle must be ended
    const now = new Date();
    if (now <= cycle.endDate) {
      throw new ForbiddenException(
        'Feedback available after cycle ends',
      );
    }

    // Get all reviews where revieweeId = me for this cycle
    const reviews = await this.prisma.review.findMany({
      where: {
        organizationId,
        cycleId,
        revieweeId: userId,
      },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data: ReceivedReviewDto[] = reviews.map((review) => ({
      id: review.id,
      type: review.type as any,
      cycle: {
        id: review.cycle.id,
        name: review.cycle.name,
        startDate: this.formatDate(review.cycle.startDate),
        endDate: this.formatDate(review.cycle.endDate),
        createdAt: this.formatDate(review.cycle.createdAt),
        updatedAt: this.formatDate(review.cycle.updatedAt),
      },
      summary: review.summary,
      strengths: review.strengths,
      areasToImprove: review.areasToImprove,
      accomplishments: review.accomplishments,
      rating: review.rating,
      createdAt: this.formatDate(review.createdAt),
      updatedAt: this.formatDate(review.updatedAt),
      reviewerDisplay: this.getReviewerDisplay(review.type, review.reviewer.name),
    }));

    return { data };
  }

  // ==================== Helper Methods ====================

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]!;
  }

  private getReviewerDisplay(
    type: string,
    reviewerName: string,
  ): { label: string } | null {
    switch (type) {
      case ReviewType.SELF:
        return { label: 'You' };
      case ReviewType.MANAGER:
        return { label: 'Manager' };
      case ReviewType.PEER:
        return null; // Anonymized
      default:
        return null;
    }
  }
}
