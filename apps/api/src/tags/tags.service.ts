import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  TagListResponse,
  TagDetailResponse,
  CreateTagRequest,
  UpdateTagRequest,
} from '@repo/contracts';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string): Promise<TagListResponse> {
    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { CandidateTag: true },
          },
        },
      }),
      this.prisma.tag.count({ where: { organizationId } }),
    ]);

    return {
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        _count: { candidates: tag._count.CandidateTag },
      })),
      total,
    } as unknown as TagListResponse;
  }

  async create(
    organizationId: string,
    data: CreateTagRequest,
  ): Promise<TagDetailResponse> {
    const existing = await this.prisma.tag.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: data.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Tag "${data.name}" already exists`);
    }

    const tag = await this.prisma.tag.create({
      data: {
        organizationId,
        name: data.name,
        type: data.type ?? null,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { CandidateTag: true },
        },
      },
    });

    return {
      id: tag.id,
      name: tag.name,
      type: tag.type,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      _count: { candidates: tag._count.CandidateTag },
    } as unknown as TagDetailResponse;
  }

  async update(
    id: string,
    organizationId: string,
    data: UpdateTagRequest,
  ): Promise<TagDetailResponse> {
    const existing = await this.prisma.tag.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (existing.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this tag');
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { CandidateTag: true },
        },
      },
    });

    return {
      id: tag.id,
      name: tag.name,
      type: tag.type,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      _count: { candidates: tag._count.CandidateTag },
    } as unknown as TagDetailResponse;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const existing = await this.prisma.tag.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (existing.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this tag');
    }

    await this.prisma.tag.delete({ where: { id } });
  }
}
