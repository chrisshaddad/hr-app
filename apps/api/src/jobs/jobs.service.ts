import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../database/prisma.service';
import type { JobStatus } from '@repo/db';
import type {
  JobListResponse,
  JobDetailResponse,
  CreateJobRequest,
  UpdateJobRequest,
} from '@repo/contracts';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: {
    organizationId: string;
    status?: JobStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<JobListResponse> {
    const { organizationId, status, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = { organizationId };
    if (status) where.status = status;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    try {
      const [jobs, total] = await Promise.all([
        this.prisma.job.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            User: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { Application: true },
            },
          },
        }),
        this.prisma.job.count({ where }),
      ]);

      return {
        jobs: jobs.map((job) => ({
          id: job.id,
          title: job.title,
          department: job.department,
          employmentType: job.employmentType,
          status: job.status,
          description: job.description,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          hiringManager: job.User ?? null,
          _count: { applications: job._count.Application },
        })),
        total,
      } as unknown as JobListResponse;
    } catch (error) {
      throw error;
    }
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<JobDetailResponse> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        Application: {
          orderBy: { appliedAt: 'desc' },
          include: {
            Candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                resumeUrl: true,
              },
            },
            _count: {
              select: { Interview: true, Communication: true },
            },
          },
        },
        _count: {
          select: { Application: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      status: job.status,
      description: job.description,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hiringManager: job.User ?? null,
      applications: job.Application.map((app) => ({
        id: app.id,
        currentStage: app.currentStage,
        source: app.source,
        appliedAt: app.appliedAt,
        candidate: {
          id: app.Candidate.id,
          firstName: app.Candidate.firstName,
          lastName: app.Candidate.lastName,
          email: app.Candidate.email,
          phone: app.Candidate.phone,
          resumeUrl: app.Candidate.resumeUrl,
        },
        _count: {
          interviews: app._count.Interview,
          communications: app._count.Communication,
        },
      })),
      _count: { applications: job._count.Application },
    } as unknown as JobDetailResponse;
  }

  async create(
    organizationId: string,
    data: CreateJobRequest,
  ): Promise<JobDetailResponse> {
    const now = new Date();
    const job = await this.prisma.job.create({
      data: {
        id: crypto.randomUUID(),
        organizationId,
        title: data.title,
        department: data.department,
        employmentType: data.employmentType,
        description: data.description ?? null,
        hiringManagerId: data.hiringManagerId ?? null,
        status: 'DRAFT',
        updatedAt: now,
      },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        Application: {
          include: {
            Candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                resumeUrl: true,
              },
            },
            _count: {
              select: { Interview: true, Communication: true },
            },
          },
        },
        _count: {
          select: { Application: true },
        },
      },
    });

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      status: job.status,
      description: job.description,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hiringManager: job.User ?? null,
      applications: [],
      _count: { applications: 0 },
    } as unknown as JobDetailResponse;
  }

  async update(
    id: string,
    organizationId: string,
    data: UpdateJobRequest,
  ): Promise<JobDetailResponse> {
    const existing = await this.prisma.job.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (existing.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        Application: {
          orderBy: { appliedAt: 'desc' },
          include: {
            Candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                resumeUrl: true,
              },
            },
            _count: {
              select: { Interview: true, Communication: true },
            },
          },
        },
        _count: {
          select: { Application: true },
        },
      },
    });

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      status: job.status,
      description: job.description,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hiringManager: job.User ?? null,
      applications: job.Application.map((app) => ({
        id: app.id,
        currentStage: app.currentStage,
        source: app.source,
        appliedAt: app.appliedAt,
        candidate: {
          id: app.Candidate.id,
          firstName: app.Candidate.firstName,
          lastName: app.Candidate.lastName,
          email: app.Candidate.email,
          phone: app.Candidate.phone,
          resumeUrl: app.Candidate.resumeUrl,
        },
        _count: {
          interviews: app._count.Interview,
          communications: app._count.Communication,
        },
      })),
      _count: { applications: job._count.Application },
    } as unknown as JobDetailResponse;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const existing = await this.prisma.job.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (existing.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    await this.prisma.job.delete({ where: { id } });
  }
}
