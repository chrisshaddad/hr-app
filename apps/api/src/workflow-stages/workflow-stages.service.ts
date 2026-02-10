import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkflowStagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all workflow stages for a job listing, ordered by rank
   */
  async findAll(jobListingId: string, organizationId: string) {
    // Verify job listing exists and belongs to org
    const jobListing = await this.prisma.jobListing.findUnique({
      where: { id: jobListingId },
      select: { organizationId: true, id: true },
    });

    if (!jobListing || jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Job listing not found');
    }

    return this.prisma.workflowStage.findMany({
      where: { jobListingId, isDeleted: false },
      orderBy: { rank: 'asc' },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Find a single workflow stage by ID
   */
  async findOne(id: string, organizationId: string) {
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id },
      include: {
        jobListing: { select: { organizationId: true } },
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!stage || stage.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Workflow stage not found');
    }

    return stage;
  }

  /**
   * Create a new workflow stage
   * Automatically assigns the next rank if not provided
   */
  async create(
    jobListingId: string,
    organizationId: string,
    data: {
      title: string;
      isLocked?: boolean;
    },
  ) {
    // Verify job listing exists and belongs to org
    const jobListing = await this.prisma.jobListing.findUnique({
      where: { id: jobListingId },
      select: { organizationId: true, id: true },
    });

    if (!jobListing || jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Job listing not found');
    }

    // Find the highest rank and automatically assign next
    const maxRank = await this.prisma.workflowStage.findFirst({
      where: { jobListingId, isDeleted: false },
      orderBy: { rank: 'desc' },
      select: { rank: true },
    });

    const nextRank = (maxRank?.rank || 0) + 1;

    return this.prisma.workflowStage.create({
      data: {
        jobListingId,
        title: data.title,
        rank: nextRank,
        isLocked: data.isLocked || false,
        isDeleted: false,
      },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Update a workflow stage
   */
  async update(
    id: string,
    organizationId: string,
    data: {
      title?: string;
      isLocked?: boolean;
    },
  ) {
    const stage = await this.findOne(id, organizationId);

    return this.prisma.workflowStage.update({
      where: { id },
      data: {
        title: data.title ?? stage.title,
        isLocked: data.isLocked ?? stage.isLocked,
      },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Reorder stages with rank updates
   * Validates that ranks are sequential with no gaps
   */
  async reorder(
    jobListingId: string,
    organizationId: string,
    stages: Array<{ id: string; rank: number }>,
  ) {
    // Verify job listing exists and belongs to org
    const jobListing = await this.prisma.jobListing.findUnique({
      where: { id: jobListingId },
      select: { organizationId: true, id: true },
    });

    if (!jobListing || jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Job listing not found');
    }

    // Validate all stage IDs belong to this job listing
    const stageIds = stages.map((s) => s.id);
    const existingStages = await this.prisma.workflowStage.findMany({
      where: { id: { in: stageIds }, jobListingId },
    });

    if (existingStages.length !== stageIds.length) {
      throw new BadRequestException(
        'One or more stages do not belong to this job listing',
      );
    }

    // Validate ranks are sequential starting from 1 with no gaps
    const ranks = stages.map((s) => s.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) {
        throw new BadRequestException(
          `Ranks must be sequential starting from 1. Gap found at position ${i + 1}`,
        );
      }
    }

    // Update all stages in a transaction
    const updates = stages.map((stage) =>
      this.prisma.workflowStage.update({
        where: { id: stage.id },
        data: { rank: stage.rank },
      }),
    );

    await this.prisma.$transaction(updates);

    // Return updated stages ordered by rank
    return this.prisma.workflowStage.findMany({
      where: { jobListingId, isDeleted: false },
      orderBy: { rank: 'asc' },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Lock a workflow stage to prevent candidate movements
   */
  async lock(id: string, organizationId: string) {
    return this.prisma.workflowStage.update({
      where: { id },
      data: { isLocked: true },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Unlock a workflow stage to allow candidate movements
   */
  async unlock(id: string, organizationId: string) {
    return this.prisma.workflowStage.update({
      where: { id },
      data: { isLocked: false },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Soft delete a workflow stage
   * Candidate placements are preserved for audit trail
   */
  async delete(id: string, organizationId: string) {
    return this.prisma.workflowStage.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
