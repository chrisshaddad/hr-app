import { Injectable, NotFoundException } from '@nestjs/common';

import type { TemplateType } from '@repo/db';
import { PrismaService } from '../database/prisma.service';
import type {
  Template,
  TemplateListResponse,
  TemplateUpdateRequest,
} from '@repo/contracts';

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

  async getTemplate(options: {
    id: string;
    organizationId: string;
  }): Promise<Template | null> {
    const { id, organizationId } = options;

    return this.prisma.template.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createTemplate(options: {
    organizationId: string;
    type: TemplateType;
    name: string;
    description?: string;
  }): Promise<Template> {
    const { organizationId, type, name, description } = options;

    return this.prisma.template.create({
      data: {
        organizationId,
        type,
        name,
        description: description ?? null,
      },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteTemplate(options: {
    id: string;
    organizationId: string;
  }): Promise<void> {
    const { id, organizationId } = options;

    const template = await this.prisma.template.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    await this.prisma.template.delete({
      where: { id },
    });
  }

  async updateTemplate(
    args: TemplateUpdateRequest & {
      id: string;
      organizationId: string;
    },
  ): Promise<Template> {
    const { id, organizationId, ...rest } = args;

    const template = await this.prisma.template.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return this.prisma.template.update({
      where: { id },
      data: rest,
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
