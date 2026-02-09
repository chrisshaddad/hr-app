import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { WorkflowStageCandidateSchema } from '@repo/contracts';

@Injectable()
export class StageCandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all candidates in a specific workflow stage
   */
  async findByStage(
    stageId: string,
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Verify stage exists and belongs to org
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id: stageId },
      include: { jobListing: { select: { organizationId: true } } },
    });

    if (!stage || stage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Workflow stage not found');
    }

    const [stageCandidates, total] = await Promise.all([
      this.prisma.workflowStageCandidate.findMany({
        where: { stageId, isDeleted: false },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              source: true,
              cVUrl: true,
              photoUrl: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.workflowStageCandidate.count({
        where: { stageId, isDeleted: false },
      }),
    ]);

    return {
      data: stageCandidates,
      total,
      page,
      limit,
      hasMore: skip + stageCandidates.length < total,
    };
  }

  /**
   * Find all workflow stages for a candidate
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

    return this.prisma.workflowStageCandidate.findMany({
      where: { candidateId, isDeleted: false },
      include: {
        stage: {
          select: { id: true, name: true, rank: true, isLocked: true },
        },
      },
      orderBy: { stage: { rank: 'asc' } },
    });
  }

  /**
   * Add a candidate to a workflow stage
   * Automatically deactivates candidate's placement in other stages of the same job listing
   */
  async addToStage(
    candidateId: string,
    stageId: string,
    organizationId: string,
    notes?: string,
  ) {
    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { organizationId: true, id: true },
    });

    if (!candidate || candidate.organizationId !== organizationId) {
      throw new NotFoundException('Candidate not found');
    }

    // Verify stage exists and belongs to org
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id: stageId },
      include: { jobListing: { select: { organizationId: true, id: true } } },
    });

    if (!stage || stage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Workflow stage not found');
    }

    // Check if stage is locked
    if (stage.isLocked) {
      throw new BadRequestException('Cannot add candidates to a locked stage');
    }

    // Find and deactivate candidate's other placements in this job listing
    const existingPlacements =
      await this.prisma.workflowStageCandidate.findMany({
        where: {
          candidateId,
          stage: { jobListingId: stage.jobListingId },
          isDeleted: false,
        },
      });

    if (existingPlacements.length > 0) {
      await this.prisma.workflowStageCandidate.updateMany({
        where: { id: { in: existingPlacements.map((p) => p.id) } },
        data: { isDeleted: true },
      });
    }

    // Add candidate to new stage
    const stagePlacement = await this.prisma.workflowStageCandidate.create({
      data: {
        candidateId,
        stageId,
        notes: notes || null,
        isDeleted: false,
      },
      include: {
        candidate: true,
        stage: true,
      },
    });

    // Create board activity
    await this.prisma.boardActivity.create({
      data: {
        jobListingId: stage.jobListingId,
        candidateId,
        stageId,
        activityType: 'MOVED',
        fromStageName: existingPlacements[0]
          ? (
              await this.prisma.workflowStage.findUnique({
                where: { id: existingPlacements[0].stageId },
                select: { name: true },
              })
            )?.name || 'Unknown'
          : 'New Candidate',
        toStageName: stage.name,
      },
    });

    return stagePlacement;
  }

  /**
   * Move a candidate to a different stage
   */
  async moveToStage(
    candidateId: string,
    fromStageId: string,
    toStageId: string,
    organizationId: string,
    notes?: string,
  ) {
    // Verify both stages exist and belong to org
    const [fromStage, toStage] = await Promise.all([
      this.prisma.workflowStage.findUnique({
        where: { id: fromStageId },
        include: { jobListing: { select: { organizationId: true } } },
      }),
      this.prisma.workflowStage.findUnique({
        where: { id: toStageId },
        include: { jobListing: { select: { organizationId: true } } },
      }),
    ]);

    if (!fromStage || fromStage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('From stage not found');
    }

    if (!toStage || toStage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('To stage not found');
    }

    // Verify same job listing
    if (fromStage.jobListingId !== toStage.jobListingId) {
      throw new BadRequestException(
        'Stages must belong to the same job listing',
      );
    }

    // Check if target stage is locked
    if (toStage.isLocked) {
      throw new BadRequestException('Cannot move candidates to a locked stage');
    }

    // Verify candidate is currently in from stage
    const currentPlacement = await this.prisma.workflowStageCandidate.findFirst(
      {
        where: { candidateId, stageId: fromStageId, isDeleted: false },
      },
    );

    if (!currentPlacement) {
      throw new BadRequestException('Candidate is not in the from stage');
    }

    // Deactivate current placement
    await this.prisma.workflowStageCandidate.update({
      where: { id: currentPlacement.id },
      data: { isDeleted: true },
    });

    // Create new placement
    const newPlacement = await this.prisma.workflowStageCandidate.create({
      data: {
        candidateId,
        stageId: toStageId,
        notes: notes || null,
        isDeleted: false,
      },
      include: {
        candidate: true,
        stage: true,
      },
    });

    // Create board activity
    await this.prisma.boardActivity.create({
      data: {
        jobListingId: toStage.jobListingId,
        candidateId,
        stageId: toStageId,
        activityType: 'MOVED',
        fromStageName: fromStage.name,
        toStageName: toStage.name,
      },
    });

    return newPlacement;
  }

  /**
   * Update candidate notes in a stage
   */
  async updateNotes(
    candidateId: string,
    stageId: string,
    organizationId: string,
    notes: string,
  ) {
    // Verify stage exists and belongs to org
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id: stageId },
      include: { jobListing: { select: { organizationId: true } } },
    });

    if (!stage || stage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Workflow stage not found');
    }

    const placement = await this.prisma.workflowStageCandidate.findFirst({
      where: { candidateId, stageId, isDeleted: false },
    });

    if (!placement) {
      throw new NotFoundException('Candidate not found in this stage');
    }

    return this.prisma.workflowStageCandidate.update({
      where: { id: placement.id },
      data: { notes },
      include: {
        candidate: true,
        stage: true,
      },
    });
  }

  /**
   * Remove a candidate from a stage (soft delete)
   */
  async removeFromStage(
    candidateId: string,
    stageId: string,
    organizationId: string,
  ) {
    // Verify stage exists and belongs to org
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id: stageId },
      include: { jobListing: { select: { organizationId: true } } },
    });

    if (!stage || stage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Workflow stage not found');
    }

    const placement = await this.prisma.workflowStageCandidate.findFirst({
      where: { candidateId, stageId, isDeleted: false },
    });

    if (!placement) {
      throw new NotFoundException('Candidate not found in this stage');
    }

    // Soft delete
    return this.prisma.workflowStageCandidate.update({
      where: { id: placement.id },
      data: { isDeleted: true },
    });
  }
}
