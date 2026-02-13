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

  /**
   * Helper to get the common include for department queries
   * not needed much here just experimenting with it for more complex entities where we want to reuse the same include in multiple places
   */
  private getDepartmentInclude() {
    return {
      _count: {
        select: { users: true },
      },
    };
  }

  /**
   * Helper to verify department exists in organization
   * Throws NotFoundException if not found
   */
  private async verifyDepartmentExists(
    organizationId: string,
    id: string,
  ): Promise<void> {
    const existing = await this.prisma.department.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async create(
    organizationId: string,
    data: CreateDepartmentRequest,
  ): Promise<DepartmentResponse> {
    return this.prisma.department.create({
      data: {
        ...data,
        organizationId,
      },
      include: this.getDepartmentInclude(),
    });
  }

  async findAll(organizationId: string): Promise<DepartmentListResponse> {
    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where: { organizationId },
        include: this.getDepartmentInclude(),
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
      include: this.getDepartmentInclude(),
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
    await this.verifyDepartmentExists(organizationId, id);

    return this.prisma.department.update({
      where: { id },
      data,
      include: this.getDepartmentInclude(),
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.verifyDepartmentExists(organizationId, id);

    await this.prisma.department.delete({
      where: { id },
    });
  }
}
