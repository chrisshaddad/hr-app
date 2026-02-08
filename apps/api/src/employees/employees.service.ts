import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { EmployeeStatus, Prisma } from '@repo/db';
import type { EmployeeListItem } from '@repo/contracts';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all employees with optional filters and search
   */
  async findAll(options: {
    organizationId: string;
    search?: string;
    statuses?: EmployeeStatus[];
    branchIds?: string[];
    jobTitles?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ employees: Array<EmployeeListItem>; total: number }> {
    const {
      organizationId,
      search,
      statuses,
      branchIds,
      jobTitles,
      page = 1,
      limit = 20,
    } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.EmployeeWhereInput = { organizationId };

    // Add status filter
    if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    }

    // Add branch/office filter
    if (branchIds && branchIds.length > 0) {
      where.branchId = { in: branchIds };
    }

    // Add job title filter
    if (jobTitles && jobTitles.length > 0) {
      where.jobTitle = { in: jobTitles };
    }

    if (search) {
      where.OR = [
        {
          personalInfo: {
            firstName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          personalInfo: {
            lastName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          lineManager: {
            personalInfo: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinDate: 'desc' },
        select: {
          id: true,
          jobTitle: true,
          status: true,
          userId: true,
          personalInfo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          lineManager: {
            select: {
              id: true,
              personalInfo: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { employees, total };
  }
}
