import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CandidateEvaluationSchema } from '@repo/contracts';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all evaluations for a candidate
   */
  async findByCandidate(candidateId: string, organizationId: string) {
    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { organizationId: true, id: true },
    });

    if (!candidate || candidate.organizationId !== organizationId) {
      throw new NotFoundException('Candidate not found');
    }

    const evaluations = await this.prisma.candidateStageEvaluation.findMany({
      where: { candidateId },
      include: {
        jobListingMember: {
          select: {
            id: true,
            canEvaluate: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        workflowStageCandidate: {
          include: {
            stage: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return evaluations;
  }

  /**
   * Find all evaluations for a job listing member
   */
  async findByMember(
    jobListingMemberId: string,
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Verify member has evaluate permission
    const member = await this.prisma.jobListingMember.findUnique({
      where: { id: jobListingMemberId },
      include: {
        jobListing: { select: { organizationId: true } },
        user: true,
      },
    });

    if (!member || member.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Job listing member not found');
    }

    if (!member.canEvaluate) {
      throw new ForbiddenException(
        'This member does not have evaluation permission',
      );
    }

    const [evaluations, total] = await Promise.all([
      this.prisma.candidateStageEvaluation.findMany({
        where: { jobListingMemberId },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          workflowStageCandidate: {
            include: {
              stage: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.candidateStageEvaluation.count({
        where: { jobListingMemberId },
      }),
    ]);

    return {
      data: evaluations,
      total,
      page,
      limit,
      hasMore: skip + evaluations.length < total,
    };
  }

  /**
   * Create or update an evaluation (upsert pattern)
   */
  async upsertEvaluation(
    jobListingMemberId: string,
    workflowStageCandidateId: string,
    candidateId: string,
    organizationId: string,
    data: {
      rating: number;
      feedback?: string;
      strengths?: string;
      weaknesses?: string;
    },
  ) {
    // Validate rating is 1-5
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Verify member has evaluate permission
    const member = await this.prisma.jobListingMember.findUnique({
      where: { id: jobListingMemberId },
      include: {
        jobListing: { select: { organizationId: true } },
      },
    });

    if (!member || member.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Job listing member not found');
    }

    if (!member.canEvaluate) {
      throw new ForbiddenException(
        'This member does not have evaluation permission',
      );
    }

    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { organizationId: true, id: true },
    });

    if (!candidate || candidate.organizationId !== organizationId) {
      throw new NotFoundException('Candidate not found');
    }

    // Verify stage candidate exists
    const stageCandidateExists =
      await this.prisma.workflowStageCandidate.findUnique({
        where: { id: workflowStageCandidateId },
      });

    if (!stageCandidateExists) {
      throw new NotFoundException('Stage candidate placement not found');
    }

    // Upsert evaluation
    return this.prisma.candidateStageEvaluation.upsert({
      where: {
        jobListingMemberId_workflowStageCandidateId: {
          jobListingMemberId,
          workflowStageCandidateId,
        },
      },
      create: {
        jobListingMemberId,
        workflowStageCandidateId,
        candidateId,
        rating: data.rating,
        feedback: data.feedback || null,
        strengths: data.strengths || null,
        weaknesses: data.weaknesses || null,
      },
      update: {
        rating: data.rating,
        feedback: data.feedback || null,
        strengths: data.strengths || null,
        weaknesses: data.weaknesses || null,
      },
      include: {
        jobListingMember: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Calculate average rating for a candidate in a stage
   */
  async calculateAverageRating(
    candidateId: string,
    workflowStageCandidateId: string,
    organizationId: string,
  ) {
    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { organizationId: true, id: true },
    });

    if (!candidate || candidate.organizationId !== organizationId) {
      throw new NotFoundException('Candidate not found');
    }

    const result = await this.prisma.candidateStageEvaluation.aggregate({
      where: { workflowStageCandidateId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      averageRating: result._avg.rating || 0,
      totalEvaluations: result._count,
    };
  }

  /**
   * Delete an evaluation
   */
  async delete(
    evaluationId: string,
    organizationId: string,
    currentUserId: string,
  ) {
    const evaluation = await this.prisma.candidateStageEvaluation.findUnique({
      where: { id: evaluationId },
      include: {
        jobListingMember: {
          include: {
            jobListing: { select: { organizationId: true } },
            user: { select: { id: true } },
          },
        },
      },
    });

    if (
      !evaluation ||
      evaluation.jobListingMember.jobListing.organizationId !== organizationId
    ) {
      throw new NotFoundException('Evaluation not found');
    }

    // Only the evaluator can delete their own evaluation
    if (evaluation.jobListingMember.user.id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own evaluations');
    }

    return this.prisma.candidateStageEvaluation.delete({
      where: { id: evaluationId },
    });
  }
}
