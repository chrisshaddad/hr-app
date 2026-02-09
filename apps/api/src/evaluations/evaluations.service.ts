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
      select: { id: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const evaluations = await this.prisma.candidateStageEvaluation.findMany({
      where: {
        stageCandidate: {
          candidate: { id: candidateId },
        },
      },
      include: {
        evaluator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stageCandidate: {
          include: {
            workflowStage: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { evaluatedAt: 'desc' },
    });

    return evaluations;
  }

  /**
   * Find all evaluations made by a specific evaluator/member
   */
  async findByMember(
    memberId: string,
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Verify member exists and belongs to this organization
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, organizationId: true },
    });

    if (!member || member.organizationId !== organizationId) {
      throw new NotFoundException('Member not found');
    }

    const [evaluations, total] = await Promise.all([
      this.prisma.candidateStageEvaluation.findMany({
        where: { memberId },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stageCandidate: {
            include: {
              candidate: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              workflowStage: { select: { id: true, title: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { evaluatedAt: 'desc' },
      }),
      this.prisma.candidateStageEvaluation.count({
        where: { memberId },
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
   * Create or update an evaluation
   */
  async upsertEvaluation(
    memberId: string,
    workflowStageCandidateId: string,
    organizationId: string,
    data: {
      rating: number;
      feedback?: string;
      strengths?: string;
      weaknesses?: string;
      recommendation?: string;
    },
  ) {
    // Validate rating is 1-5
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Verify member exists and belongs to this organization
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, organizationId: true },
    });

    if (!member || member.organizationId !== organizationId) {
      throw new NotFoundException('Member not found');
    }

    // Verify stage candidate exists
    const stageCandidateExists =
      await this.prisma.workflowStageCandidate.findUnique({
        where: { id: workflowStageCandidateId },
      });

    if (!stageCandidateExists) {
      throw new NotFoundException('Stage candidate placement not found');
    }

    // Check if evaluation already exists
    const existingEvaluation =
      await this.prisma.candidateStageEvaluation.findFirst({
        where: {
          workflowStageCandidateId,
          memberId,
        },
      });

    if (existingEvaluation) {
      // Update existing evaluation
      return this.prisma.candidateStageEvaluation.update({
        where: { id: existingEvaluation.id },
        data: {
          rating: data.rating,
          feedback: data.feedback || null,
          strengths: data.strengths || null,
          weaknesses: data.weaknesses || null,
          recommendation: data.recommendation || null,
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stageCandidate: {
            include: {
              candidate: {
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

    // Create new evaluation
    return this.prisma.candidateStageEvaluation.create({
      data: {
        workflowStageCandidateId,
        memberId,
        rating: data.rating,
        feedback: data.feedback || null,
        strengths: data.strengths || null,
        weaknesses: data.weaknesses || null,
        recommendation: data.recommendation || null,
      },
      include: {
        evaluator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stageCandidate: {
          include: {
            candidate: {
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
    workflowStageCandidateId: string,
    organizationId: string,
  ) {
    // Verify stage candidate exists
    const stageCandidate = await this.prisma.workflowStageCandidate.findUnique({
      where: { id: workflowStageCandidateId },
    });

    if (!stageCandidate) {
      throw new NotFoundException('Stage candidate placement not found');
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
        evaluator: { select: { id: true, organizationId: true } },
        stageCandidate: {
          include: {
            jobListing: { select: { organizationId: true } },
          },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    // Verify belongs to this organization
    if (
      evaluation.stageCandidate.jobListing.organizationId !== organizationId
    ) {
      throw new NotFoundException('Evaluation not found');
    }

    // Only the evaluator can delete their own evaluation
    if (evaluation.evaluator.id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own evaluations');
    }

    return this.prisma.candidateStageEvaluation.delete({
      where: { id: evaluationId },
    });
  }
}
