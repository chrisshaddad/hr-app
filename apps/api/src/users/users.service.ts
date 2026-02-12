import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { UsersListResponse } from '@repo/contracts';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users in an organization
   */
  async findByOrganization(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<UsersListResponse> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isConfirmed: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where: { organizationId } }),
    ]);

    return { users, total, page, limit };
  }
}
