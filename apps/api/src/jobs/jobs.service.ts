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

    const where: Prisma.JobWhereInput = { organizationId, deletedAt: null };
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
            JobTag: {
              include: { Tag: { select: { id: true, name: true } } },
            },
            JobHiringStage: {
              orderBy: { orderIndex: 'asc' },
              include: {
                HiringStage: {
                  select: { id: true, name: true, isLocked: true },
                },
              },
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
          quantity: job.quantity,
          expectedClosingDate: job.expectedClosingDate,
          location: job.location,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          hiringManager: job.User ?? null,
          tags: job.JobTag.map((jt) => jt.Tag),
          hiringStages: job.JobHiringStage.map((jhs) => ({
            hiringStageId: jhs.hiringStageId,
            orderIndex: jhs.orderIndex,
            hiringStage: jhs.HiringStage,
          })),
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
        JobTag: {
          include: { Tag: { select: { id: true, name: true } } },
        },
        JobHiringStage: {
          orderBy: { orderIndex: 'asc' },
          include: {
            HiringStage: { select: { id: true, name: true, isLocked: true } },
          },
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
      quantity: job.quantity,
      expectedClosingDate: job.expectedClosingDate,
      location: job.location,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hiringManager: job.User ?? null,
      tags: job.JobTag.map((jt) => jt.Tag),
      hiringStages:
        (job as any).JobHiringStage?.map((jhs: any) => ({
          hiringStageId: jhs.hiringStageId,
          orderIndex: jhs.orderIndex,
          hiringStage: jhs.HiringStage,
        })) ?? [],
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
    const jobId = crypto.randomUUID();
    const { tagIds, hiringStages, ...jobData } = data;

    const job = await this.prisma.$transaction(async (tx) => {
      const created = await tx.job.create({
        data: {
          id: jobId,
          organizationId,
          title: jobData.title,
          department: jobData.department,
          employmentType: jobData.employmentType,
          description: jobData.description ?? null,
          hiringManagerId: jobData.hiringManagerId ?? null,
          quantity: jobData.quantity ?? 1,
          expectedClosingDate: jobData.expectedClosingDate
            ? new Date(jobData.expectedClosingDate)
            : null,
          location: jobData.location ?? null,
          status: 'DRAFT',
          updatedAt: now,
        },
      });

      if (tagIds && tagIds.length > 0) {
        await tx.jobTag.createMany({
          data: tagIds.map((tagId) => ({ jobId: created.id, tagId })),
          skipDuplicates: true,
        });
      }

      // Use custom hiring stages if provided, otherwise copy global defaults
      if (hiringStages && hiringStages.length > 0) {
        await tx.jobHiringStage.createMany({
          data: hiringStages.map((hs) => ({
            jobId: created.id,
            hiringStageId: hs.hiringStageId,
            orderIndex: hs.orderIndex,
          })),
          skipDuplicates: true,
        });
      } else {
        const globalStages = await tx.hiringStage.findMany({
          where: { organizationId },
          orderBy: { orderIndex: 'asc' },
        });
        if (globalStages.length > 0) {
          await tx.jobHiringStage.createMany({
            data: globalStages.map((stage) => ({
              jobId: created.id,
              hiringStageId: stage.id,
              orderIndex: stage.orderIndex,
            })),
            skipDuplicates: true,
          });
        }
      }

      return tx.job.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          User: { select: { id: true, name: true, email: true } },
          JobTag: { include: { Tag: { select: { id: true, name: true } } } },
          JobHiringStage: {
            orderBy: { orderIndex: 'asc' },
            include: {
              HiringStage: { select: { id: true, name: true, isLocked: true } },
            },
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
              _count: { select: { Interview: true, Communication: true } },
            },
          },
          _count: { select: { Application: true } },
        },
      });
    });

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      status: job.status,
      description: job.description,
      quantity: job.quantity,
      expectedClosingDate: job.expectedClosingDate,
      location: job.location,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hiringManager: job.User ?? null,
      tags: job.JobTag.map((jt) => jt.Tag),
      hiringStages:
        (job as any).JobHiringStage?.map((jhs: any) => ({
          hiringStageId: jhs.hiringStageId,
          orderIndex: jhs.orderIndex,
          hiringStage: jhs.HiringStage,
        })) ?? [],
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

    const { expectedClosingDate, tagIds, hiringStages, ...rest } = data;

    const job = await this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: {
          ...rest,
          ...(expectedClosingDate !== undefined && {
            expectedClosingDate: expectedClosingDate
              ? new Date(expectedClosingDate)
              : null,
          }),
          updatedAt: new Date(),
        },
      });

      if (tagIds !== undefined) {
        await tx.jobTag.deleteMany({ where: { jobId: id } });
        if (tagIds.length > 0) {
          await tx.jobTag.createMany({
            data: tagIds.map((tagId) => ({ jobId: id, tagId })),
            skipDuplicates: true,
          });
        }
      }

      if (hiringStages !== undefined) {
        await tx.jobHiringStage.deleteMany({ where: { jobId: id } });
        if (hiringStages.length > 0) {
          await tx.jobHiringStage.createMany({
            data: hiringStages.map((hs) => ({
              jobId: id,
              hiringStageId: hs.hiringStageId,
              orderIndex: hs.orderIndex,
            })),
            skipDuplicates: true,
          });
        }
      }

      return tx.job.findUniqueOrThrow({
        where: { id },
        include: {
          User: { select: { id: true, name: true, email: true } },
          JobTag: { include: { Tag: { select: { id: true, name: true } } } },
          JobHiringStage: {
            orderBy: { orderIndex: 'asc' },
            include: {
              HiringStage: { select: { id: true, name: true, isLocked: true } },
            },
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
              _count: { select: { Interview: true, Communication: true } },
            },
          },
          _count: { select: { Application: true } },
        },
      });
    });

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      status: job.status,
      description: job.description,
      quantity: job.quantity,
      expectedClosingDate: job.expectedClosingDate,
      location: job.location,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hiringManager: job.User ?? null,
      tags: job.JobTag.map((jt) => jt.Tag),
      hiringStages:
        (job as any).JobHiringStage?.map((jhs: any) => ({
          hiringStageId: jhs.hiringStageId,
          orderIndex: jhs.orderIndex,
          hiringStage: jhs.HiringStage,
        })) ?? [],
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

    await this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }
}
