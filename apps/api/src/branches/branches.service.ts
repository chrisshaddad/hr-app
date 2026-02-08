import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { BranchListResponse } from '@repo/contracts';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string): Promise<BranchListResponse> {
    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          createdAt: true,
        },
      }),
      this.prisma.branch.count({ where: { organizationId } }),
    ]);

    return { branches, total } as unknown as BranchListResponse;
  }
}
