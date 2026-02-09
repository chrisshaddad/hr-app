import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  CandidateCreateRequest,
  CandidateUpdateRequest,
  CandidateDetailResponse,
  CandidateListResponse,
} from '@repo/contracts';

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    options: {
      jobListingId?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<CandidateListResponse> {
    const { jobListingId, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      ...(jobListingId && {
        stagePlacements: {
          some: { jobListingId },
        },
      }),
    };

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { tags: true },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
      total,
      page,
      limit,
      hasMore: skip + candidates.length < total,
    };
  }

  async findOne(id: string): Promise<CandidateDetailResponse> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!candidate || candidate.isDeleted) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async create(data: CandidateCreateRequest): Promise<CandidateDetailResponse> {
    // Check for unique email+phone
    const existing = await this.prisma.candidate.findUnique({
      where: {
        email_phoneNumber: {
          email: data.email,
          phoneNumber: data.phoneNumber || '',
        },
      },
    });

    if (existing && !existing.isDeleted) {
      throw new BadRequestException('Candidate already exists');
    }

    const candidate = await this.prisma.candidate.create({
      data,
      include: { tags: true },
    });

    return candidate;
  }

  async update(
    id: string,
    data: CandidateUpdateRequest,
  ): Promise<CandidateDetailResponse> {
    await this.findOne(id);

    const candidate = await this.prisma.candidate.update({
      where: { id },
      data,
      include: { tags: true },
    });

    return candidate;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.candidate.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async search(query: string, take = 10): Promise<CandidateDetailResponse[]> {
    return this.prisma.candidate.findMany({
      where: {
        isDeleted: false,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      include: { tags: true },
    });
  }

  async addTag(candidateId: string, tagId: string): Promise<void> {
    await this.findOne(candidateId);

    // Verify tag exists
    const tag = await this.prisma.tagSetting.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        tags: {
          connect: { id: tagId },
        },
      },
    });
  }

  async removeTag(candidateId: string, tagId: string): Promise<void> {
    await this.findOne(candidateId);

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });
  }
}
