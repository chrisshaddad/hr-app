import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  JobListingCreateRequest,
  JobListingUpdateRequest,
  JobListingDetailResponse,
  JobListingListResponse,
  JobListingStatus,
} from '@repo/contracts';

@Injectable()
export class JobListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: {
      status?: JobListingStatus;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<JobListingListResponse> {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      isDeleted: false,
      ...(status && { status }),
    };

    const [listings, total] = await Promise.all([
      this.prisma.jobListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { members: true, stageCandidates: true },
          },
        },
      }),
      this.prisma.jobListing.count({ where }),
    ]);

    return {
      data: listings.map((l) => ({
        id: l.id,
        organizationId: l.organizationId,
        departmentId: l.departmentId,
        officeId: l.officeId,
        title: l.title,
        description: l.description,
        status: l.status,
        employmentType: l.employmentType,
        salaryMin: l.salaryMin ? Number(l.salaryMin) : null,
        salaryMax: l.salaryMax ? Number(l.salaryMax) : null,
        salaryCurrency: l.salaryCurrency || '',
        remoteOption: l.remoteOption,
        openingsQuantity: l.openingsQuantity,
        experienceYears: l.experienceYears,
        educationLevel: l.educationLevel,
        skills: l.skills,
        benefits: l.benefits,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        publishedAt: l.publishedAt,
        closingDate: l.closingDate,
        createdBy: l.createdBy,
        memberCount: l._count.members,
        candidateCount: l._count.stageCandidates,
      })),
      total,
      page,
      limit,
      hasMore: skip + listings.length < total,
    };
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<JobListingDetailResponse> {
    const listing = await this.prisma.jobListing.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, stageCandidates: true },
        },
      },
    });

    if (
      !listing ||
      listing.organizationId !== organizationId ||
      listing.isDeleted
    ) {
      throw new NotFoundException(`Job listing with ID ${id} not found`);
    }

    return {
      ...listing,
      salaryMin: listing.salaryMin ? Number(listing.salaryMin) : null,
      salaryMax: listing.salaryMax ? Number(listing.salaryMax) : null,
      salaryCurrency: listing.salaryCurrency ?? '',
      memberCount: listing._count.members,
      candidateCount: listing._count.stageCandidates,
    };
  }

  async create(
    organizationId: string,
    data: JobListingCreateRequest,
    userId: string,
  ): Promise<JobListingDetailResponse> {
    // Verify department exists in organization
    const department = await this.prisma.department.findUnique({
      where: { id: data.departmentId },
      include: { branch: true },
    });

    if (!department || department.branch.organizationId !== organizationId) {
      throw new BadRequestException(
        'Department not found in this organization',
      );
    }

    const listing = await this.prisma.jobListing.create({
      data: {
        organizationId,
        createdById: userId,
        ...data,
        status: 'DRAFT',
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, stageCandidates: true },
        },
      },
    });

    return {
      ...listing,
      salaryMin: listing.salaryMin ? Number(listing.salaryMin) : null,
      salaryMax: listing.salaryMax ? Number(listing.salaryMax) : null,
      salaryCurrency: listing.salaryCurrency ?? '',
      memberCount: listing._count.members,
      candidateCount: listing._count.stageCandidates,
    };
  }

  async update(
    id: string,
    organizationId: string,
    data: JobListingUpdateRequest,
  ): Promise<JobListingDetailResponse> {
    const listing = await this.findOne(id, organizationId);

    const updated = await this.prisma.jobListing.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, stageCandidates: true },
        },
      },
    });

    return {
      ...updated,
      salaryMin: updated.salaryMin ? Number(updated.salaryMin) : null,
      salaryMax: updated.salaryMax ? Number(updated.salaryMax) : null,
      salaryCurrency: updated.salaryCurrency ?? '',
      memberCount: updated._count.members,
      candidateCount: updated._count.stageCandidates,
    };
  }

  async publish(
    id: string,
    organizationId: string,
  ): Promise<JobListingDetailResponse> {
    const listing = await this.findOne(id, organizationId);

    if (listing.status !== 'DRAFT') {
      throw new BadRequestException('Can only publish draft listings');
    }

    return this.update(id, organizationId, {
      status: 'ACTIVE',
      publishedAt: new Date(),
    });
  }

  async pause(
    id: string,
    organizationId: string,
  ): Promise<JobListingDetailResponse> {
    const listing = await this.findOne(id, organizationId);

    if (listing.status !== 'ACTIVE') {
      throw new BadRequestException('Can only pause active listings');
    }

    return this.update(id, organizationId, { status: 'PAUSED' });
  }

  async close(
    id: string,
    organizationId: string,
  ): Promise<JobListingDetailResponse> {
    const listing = await this.findOne(id, organizationId);

    if (listing.status === 'CLOSED' || listing.status === 'ARCHIVED') {
      throw new BadRequestException(
        'Cannot close already closed/archived listing',
      );
    }

    return this.update(id, organizationId, { status: 'CLOSED' });
  }

  async archive(
    id: string,
    organizationId: string,
  ): Promise<JobListingDetailResponse> {
    const listing = await this.findOne(id, organizationId);

    return this.update(id, organizationId, { status: 'ARCHIVED' });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    // Verify listing exists
    await this.findOne(id, organizationId);

    await this.prisma.jobListing.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async addMember(
    jobId: string,
    organizationId: string,
    memberId: string,
    canEdit: boolean,
    canEvaluate: boolean,
  ): Promise<void> {
    // Verify job listing exists
    await this.findOne(jobId, organizationId);

    // Verify member exists in organization
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== organizationId) {
      throw new BadRequestException('Member not found in organization');
    }

    // Add member
    await this.prisma.jobListingMember.upsert({
      where: { jobListingId_memberId: { jobListingId: jobId, memberId } },
      create: {
        jobListingId: jobId,
        memberId,
        canEdit,
        canEvaluate,
      },
      update: { canEdit, canEvaluate },
    });
  }

  async removeMember(jobId: string, memberId: string): Promise<void> {
    await this.prisma.jobListingMember.delete({
      where: { jobListingId_memberId: { jobListingId: jobId, memberId } },
    });
  }
}
