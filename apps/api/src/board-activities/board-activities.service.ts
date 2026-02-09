import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BoardActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all activities for a job listing
   */
  async findByJobListing(
    jobListingId: string,
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Verify job listing exists and belongs to org
    const jobListing = await this.prisma.jobListing.findUnique({
      where: { id: jobListingId },
      select: { organizationId: true, id: true },
    });

    if (!jobListing || jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Job listing not found');
    }

    const [activities, total] = await Promise.all([
      this.prisma.boardActivity.findMany({
        where: { jobListingId },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          stage: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.boardActivity.count({ where: { jobListingId } }),
    ]);

    return {
      data: activities,
      total,
      page,
      limit,
      hasMore: skip + activities.length < total,
    };
  }

  /**
   * Find all activities for a candidate
   */
  async findByCandidate(
    candidateId: string,
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { organizationId: true, id: true },
    });

    if (!candidate || candidate.organizationId !== organizationId) {
      throw new NotFoundException('Candidate not found');
    }

    const [activities, total] = await Promise.all([
      this.prisma.boardActivity.findMany({
        where: { candidateId },
        include: {
          stage: {
            select: { id: true, name: true },
          },
          jobListing: {
            select: { id: true, title: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.boardActivity.count({ where: { candidateId } }),
    ]);

    return {
      data: activities,
      total,
      page,
      limit,
      hasMore: skip + activities.length < total,
    };
  }

  /**
   * Get activity details by ID
   */
  async findOne(id: string, organizationId: string) {
    const activity = await this.prisma.boardActivity.findUnique({
      where: { id },
      include: {
        jobListing: { select: { organizationId: true } },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        stage: {
          select: { id: true, name: true },
        },
      },
    });

    if (!activity || activity.jobListing.organizationId !== organizationId) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }
}
