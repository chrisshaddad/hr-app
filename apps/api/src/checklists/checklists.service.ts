import { Injectable, NotFoundException } from '@nestjs/common';

import type { TemplateType } from '@repo/db';
import { PrismaService } from '../database/prisma.service';
import type {
  Template,
  TemplateListResponse,
  TemplateTask,
  TemplateUpdateRequest,
  TemplateTaskCreateRequest,
  TemplateTaskUpdateRequest,
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

  async getTemplate(options: { id: string; organizationId: string }): Promise<
    | (Template & {
        templateTasks: TemplateTask[];
      })
    | null
  > {
    const { id, organizationId } = options;

    return this.prisma.template.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        templateTasks: true,
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

  async createTemplateTask(options: {
    templateId: string;
    organizationId: string;
    data: TemplateTaskCreateRequest;
  }): Promise<TemplateTask> {
    const { templateId, organizationId, data } = options;

    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return this.prisma.templateTask.create({
      data: {
        templateId,
        order: data.order,
        name: data.name,
        taskType: data.taskType,
        description: data.description ?? null,
        dueInDays: data.dueInDays ?? null,
      },
    });
  }

  async updateTemplateTask(options: {
    id: string;
    templateId: string;
    organizationId: string;
    data: TemplateTaskUpdateRequest;
  }): Promise<TemplateTask> {
    const { id, templateId, organizationId, data } = options;

    const templateTask = await this.prisma.templateTask.findFirst({
      where: {
        id,
        templateId,
      },
      include: {
        template: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!templateTask) {
      throw new NotFoundException(`Template task with ID ${id} not found`);
    }

    if (templateTask.template.organizationId !== organizationId) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return this.prisma.templateTask.update({
      where: { id },
      data,
    });
  }

  async deleteTemplateTask(args: {
    id: string;
    organizationId: string;
  }): Promise<void> {
    const { id, organizationId } = args;

    const templateTask = await this.prisma.templateTask.findFirst({
      where: {
        id,
      },
      include: {
        template: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!templateTask) {
      throw new NotFoundException(`Template task with ID ${id} not found`);
    }

    if (templateTask.template.organizationId !== organizationId) {
      throw new NotFoundException(`Template task with ID ${id} not found`);
    }

    const res = await this.prisma.templateTask.delete({
      where: { id },
    });

    if (res == null) {
      throw new NotFoundException(`Template task with ID ${id} not found`);
    }
  }
}
