import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EmailTemplateSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all email templates for an organization
   */
  async findByOrganization(
    workflowStageId: string,
    options: {
      emailTemplateTypeId?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { emailTemplateTypeId, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = { ...(emailTemplateTypeId && { emailTemplateTypeId }) };

    const [templates, total] = await Promise.all([
      this.prisma.emailTemplateSetting.findMany({
        include: {
          emailTemplateType: {
            select: { id: true, title: true, description: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emailTemplateSetting.count({}),
    ]);

    return {
      data: templates,
      total,
      page,
      limit,
      hasMore: skip + templates.length < total,
    };
  }

  /**
   * Find a specific template setting
   */
  async findOne(id: string, workflowStageId: string) {
    const template = await this.prisma.emailTemplateSetting.findUnique({
      where: { id },
      include: {
        emailTemplateType: {
          select: { id: true, title: true, description: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  /**
   * Create a new email template
   */
  async create(
    workflowStageId: string,
    data: {
      emailTemplateTypeId: string;
      subject: string;
      body: string;
      isActive?: boolean;
    },
  ) {
    // Verify template type exists
    const emailTemplateType = await this.prisma.emailTemplateType.findUnique({
      where: { id: data.emailTemplateTypeId },
    });

    if (!emailTemplateType) {
      throw new NotFoundException('Template type not found');
    }

    // Check if template already exists for this type
    const existing = await this.prisma.emailTemplateSetting.findFirst({
      where: {
        emailTemplateTypeId: data.emailTemplateTypeId,
      },
    });

    if (existing) {
      throw new BadRequestException('Template for this type already exists');
    }

    return this.prisma.emailTemplateSetting.create({
      data: {
        workflowStageId,
        emailTemplateTypeId: data.emailTemplateTypeId,
        subject: data.subject,
        body: data.body,
        isActive: data.isActive ?? true,
      },
      include: {
        emailTemplateType: {
          select: { id: true, title: true, description: true },
        },
      },
    });
  }

  /**
   * Update an email template
   */
  async update(
    id: string,
    workflowStageId: string,
    data: {
      subject?: string;
      body?: string;
      isActive?: boolean;
    },
  ) {
    const template = await this.findOne(id, workflowStageId);

    return this.prisma.emailTemplateSetting.update({
      where: { id },
      data: {
        subject: data.subject ?? template.subject,
        body: data.body ?? template.body,
        isActive: data.isActive ?? template.isActive,
      },
      include: {
        emailTemplateType: {
          select: { id: true, title: true, description: true },
        },
      },
    });
  }

  /**
   * Delete an email template
   */
  async delete(id: string, workflowStageId: string) {
    const template = await this.findOne(id, workflowStageId);

    return this.prisma.emailTemplateSetting.delete({
      where: { id },
    });
  }

  /**
   * Get default template for a type
   */
  async getActiveTemplate(
    emailTemplateTypeId: string,
    workflowStageId: string,
  ) {
    const template = await this.prisma.emailTemplateSetting.findFirst({
      where: {
        emailTemplateTypeId: emailTemplateTypeId,
        workflowStageId,
        isActive: true,
      },
      include: {
        emailTemplateType: { select: { id: true, title: true } },
      },
    });

    if (!template) {
      throw new NotFoundException(
        'No active template found for this type in your organization',
      );
    }

    return template;
  }

  /**
   * Toggle template active status
   */
  async toggleActive(id: string, workflowStageId: string) {
    const template = await this.findOne(id, workflowStageId);

    return this.prisma.emailTemplateSetting.update({
      where: { id },
      data: { isActive: !template.isActive },
      include: {
        emailTemplateType: {
          select: { id: true, title: true, description: true },
        },
      },
    });
  }
}
