import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentDetailResponse,
  DepartmentListResponse,
} from '@repo/contracts';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    branchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<DepartmentListResponse> {
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      this.prisma.department.count({ where: { branchId } }),
    ]);

    return {
      data: departments.map((d) => ({
        ...d,
        userCount: d._count.users,
      })),
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async findOne(
    id: string,
    branchId?: string,
  ): Promise<DepartmentDetailResponse> {
    const where: any = { id };
    if (branchId) {
      where.branchId = branchId;
    }

    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (branchId && department.branchId !== branchId) {
      throw new NotFoundException(
        `Department with ID ${id} not found in branch`,
      );
    }

    return {
      ...department,
      userCount: department._count.users,
    };
  }

  async create(
    branchId: string,
    data: DepartmentCreateRequest,
  ): Promise<DepartmentDetailResponse> {
    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const department = await this.prisma.department.create({
      data: {
        branchId,
        ...data,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return {
      ...department,
      userCount: department._count.users,
    };
  }

  async update(
    id: string,
    branchId: string,
    data: DepartmentUpdateRequest,
  ): Promise<DepartmentDetailResponse> {
    // Verify department belongs to branch
    await this.findOne(id, branchId);

    const department = await this.prisma.department.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return {
      ...department,
      userCount: department._count.users,
    };
  }

  async delete(id: string, branchId: string): Promise<void> {
    // Verify department belongs to branch
    await this.findOne(id, branchId);

    await this.prisma.department.delete({
      where: { id },
    });
  }
}
