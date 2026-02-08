import { Injectable } from '@nestjs/common';

import type {
  JobResponse,
  JobListResponse,
  CreateJobRequest,
} from '@repo/contracts';
import { JobStatus } from '@repo/db';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create job
  async create(
    data: CreateJobRequest,
    organizationId: string,
  ): Promise<JobResponse> {
    const job = await this.prisma.job.create({
      data: {
        organizationId,
        title: data.title,
        status: JobStatus.draft,
        description: data.description,
        location: data.location || null,
        employmentType: data.employmentType,
        department: data.department || null,
        experienceLevel: data.experienceLevel || null,
        expectedClosingDate: data.expectedClosingDate || null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return job as JobResponse;
  }

  // Get all jobs by organization id
  async findAll(
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<JobListResponse> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where: { organizationId } }),
    ]);

    return {
      page,
      total,
      limit,
      jobs: jobs as JobResponse[],
      totalPages: Math.ceil(total / limit),
    };
  }
}
