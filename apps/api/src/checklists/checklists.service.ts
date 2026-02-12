import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { TemplateType } from '@repo/db';
import type { TemplateListResponse } from '@repo/contracts';

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTemplates(options: {
    organizationId: string;
    type?: TemplateType;
    page?: number;
    limit?: number;
  }): Promise<TemplateListResponse> {
    const { organizationId, type, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      ...(type ? { type } : {}),
    };

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          type: true,
          name: true,
          description: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return { templates, total };
  }
}
