import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentResponse,
  DepartmentListResponse,
} from '@repo/contracts';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: CreateDepartmentRequest,
  ): Promise<DepartmentResponse> {
    return this.prisma.department.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findAll(organizationId: string): Promise<DepartmentListResponse> {
    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where: { organizationId },
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.department.count({
        where: { organizationId },
      }),
    ]);

    return { departments, total };
  }

  async findOne(
    organizationId: string,
    id: string,
  ): Promise<DepartmentResponse> {
    const department = await this.prisma.department.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateDepartmentRequest,
  ): Promise<DepartmentResponse> {
    // Ensure department belongs to organization
    const existing = await this.prisma.department.findUnique({
      where: { id: id, organizationId: organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return this.prisma.department.update({
      where: { id: existing.id },
      data,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    // Ensure department belongs to organization
    const existing = await this.findOne(organizationId, id);

    await this.prisma.department.delete({
      where: { id: existing.id },
    });
  }
}
