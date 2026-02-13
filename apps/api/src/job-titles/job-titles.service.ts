import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateJobTitleRequest,
  UpdateJobTitleRequest,
  JobTitleResponse,
  JobTitleListResponse,
} from '@repo/contracts';

@Injectable()
export class JobTitlesService {
  constructor(private readonly prisma: PrismaService) {}

  private getJobTitleInclude() {
    return {
      _count: {
        select: { employments: true },
      },
    };
  }

  private async verifyJobTitleExists(
    organizationId: string,
    id: string,
  ): Promise<void> {
    const existing = await this.prisma.jobTitle.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Job title with ID ${id} not found`);
    }
  }

  async create(
    organizationId: string,
    data: CreateJobTitleRequest,
  ): Promise<JobTitleResponse> {
    // Check for duplicate title within organization
    const existing = await this.prisma.jobTitle.findFirst({
      where: { organizationId, title: data.title },
    });

    if (existing) {
      throw new ConflictException(
        `Job title "${data.title}" already exists in this organization`,
      );
    }

    return this.prisma.jobTitle.create({
      data: {
        ...data,
        organizationId,
      },
      include: this.getJobTitleInclude(),
    });
  }

  async findAll(
    organizationId: string,
    includeInactive = false,
  ): Promise<JobTitleListResponse> {
    const where = {
      organizationId,
      ...(includeInactive ? {} : { isActive: true }),
    };

    const [jobTitles, total] = await Promise.all([
      this.prisma.jobTitle.findMany({
        where,
        include: this.getJobTitleInclude(),
        orderBy: { title: 'asc' },
      }),
      this.prisma.jobTitle.count({ where }),
    ]);

    return { jobTitles, total };
  }

  async findOne(organizationId: string, id: string): Promise<JobTitleResponse> {
    const jobTitle = await this.prisma.jobTitle.findFirst({
      where: { id, organizationId },
      include: this.getJobTitleInclude(),
    });

    if (!jobTitle) {
      throw new NotFoundException(`Job title with ID ${id} not found`);
    }

    return jobTitle;
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateJobTitleRequest,
  ): Promise<JobTitleResponse> {
    await this.verifyJobTitleExists(organizationId, id);

    // Check for duplicate title if title is being updated
    if (data.title) {
      const existing = await this.prisma.jobTitle.findFirst({
        where: {
          organizationId,
          title: data.title,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Job title "${data.title}" already exists in this organization`,
        );
      }
    }

    return this.prisma.jobTitle.update({
      where: { id },
      data,
      include: this.getJobTitleInclude(),
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.verifyJobTitleExists(organizationId, id);

    // Soft delete by setting isActive to false
    await this.prisma.jobTitle.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
