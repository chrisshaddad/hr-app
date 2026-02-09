import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  BranchCreateRequest,
  BranchUpdateRequest,
  BranchDetailResponse,
  BranchListResponse,
} from '@repo/contracts';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string): Promise<BranchListResponse> {
    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { departments: true },
          },
        },
      }),
      this.prisma.branch.count({ where: { organizationId } }),
    ]);

    return {
      data: branches.map((b) => ({
        ...b,
        departmentCount: b._count.departments,
      })),
      total,
    };
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<BranchDetailResponse> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    if (!branch || branch.organizationId !== organizationId) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return {
      ...branch,
      departmentCount: branch._count.departments,
    };
  }

  async create(
    organizationId: string,
    data: BranchCreateRequest,
  ): Promise<BranchDetailResponse> {
    const branch = await this.prisma.branch.create({
      data: {
        organizationId,
        ...data,
      },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    return {
      ...branch,
      departmentCount: branch._count.departments,
    };
  }

  async update(
    id: string,
    organizationId: string,
    data: BranchUpdateRequest,
  ): Promise<BranchDetailResponse> {
    // Verify branch belongs to organization
    await this.findOne(id, organizationId);

    const branch = await this.prisma.branch.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    return {
      ...branch,
      departmentCount: branch._count.departments,
    };
  }

  async delete(id: string, organizationId: string): Promise<void> {
    // Verify branch belongs to organization
    await this.findOne(id, organizationId);

    await this.prisma.branch.delete({
      where: { id },
    });
  }
}
