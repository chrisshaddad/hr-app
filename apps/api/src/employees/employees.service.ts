import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { EmployeeListResponse, userResponseSchema } from '@repo/contracts';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string | null,
    pagination?: { page: number; limit: number },
  ): Promise<EmployeeListResponse> {
    if (!organizationId) {
      return { employees: [], total: 0, page: 1, limit: 10 };
    }

    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, Math.max(1, pagination?.limit ?? 10));
    const offset = (page - 1) * limit;

    const [total, employees] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: {
          organizationId,
        },
      }),
      this.prisma.user.findMany({
        where: {
          organizationId,
        },
        include: { profile: true, department: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      employees: employees.map((employee) =>
        userResponseSchema.parse({
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
          organizationId: employee.organizationId,
          departmentId: employee.departmentId,
          isConfirmed: employee.isConfirmed,
          profile: null,
          createdAt: employee.createdAt.toISOString(),
          department: employee.department
            ? {
                id: employee.department.id,
                name: employee.department.name,
              }
            : null,
        }),
      ),
      total,
      page,
      limit,
    };
  }
}
