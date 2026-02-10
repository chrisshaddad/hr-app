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
    organizationId: string,
    options: { templateTypeId?: string; page?: number; limit?: number } = {},
  ) {
    const { templateTypeId, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = { ...(templateTypeId && { templateTypeId }) };

    const [templates, total] = await Promise.all([
      this.prisma.emailTemplateSetting.findMany({
        include: {
          templateType: {
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
  async findOne(id: string, organizationId: string) {
    const template = await this.prisma.emailTemplateSetting.findUnique({
      where: { id },
      include: {
        templateType: { select: { id: true, title: true, description: true } },
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
    organizationId: string,
    data: {
      templateTypeId: string;
      subject: string;
      htmlContent: string;
      isActive?: boolean;
    },
  ) {
    // Verify template type exists
    const templateType = await this.prisma.emailTemplateType.findUnique({
      where: { id: data.templateTypeId },
    });

    if (!templateType) {
      throw new NotFoundException('Template type not found');
    }

    // Check if template already exists for this type
    const existing = await this.prisma.emailTemplateSetting.findFirst({
      where: {
        templateTypeId: data.templateTypeId,
      },
    });

    if (existing) {
      throw new BadRequestException('Template for this type already exists');
    }

    return this.prisma.emailTemplateSetting.create({
      data: {
        templateTypeId: data.templateTypeId,
        subject: data.subject,
        body: data.htmlContent,
        isActive: data.isActive ?? true,
      },
      include: {
        templateType: { select: { id: true, title: true, description: true } },
      },
    });
  }

  /**
   * Update an email template
   */
  async update(
    id: string,
    organizationId: string,
    data: {
      subject?: string;
      htmlContent?: string;
      isActive?: boolean;
    },
  ) {
    const template = await this.findOne(id, organizationId);

    return this.prisma.emailTemplateSetting.update({
      where: { id },
      data: {
        subject: data.subject ?? template.subject,
        htmlContent: data.htmlContent ?? template.htmlContent,
        isActive: data.isActive ?? template.isActive,
      },
      include: {
        templateType: { select: { id: true, name: true, description: true } },
      },
    });
  }

  /**
   * Delete an email template
   */
  async delete(id: string, organizationId: string) {
    const template = await this.findOne(id, organizationId);

    return this.prisma.emailTemplateSetting.delete({
      where: { id },
    });
  }

  /**
   * Get default template for a type
   */
  async getActiveTemplate(templateTypeId: string, organizationId: string) {
    const template = await this.prisma.emailTemplateSetting.findFirst({
      where: { templateTypeId, organizationId, isActive: true },
      include: {
        templateType: { select: { id: true, name: true } },
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
  async toggleActive(id: string, organizationId: string) {
    const template = await this.findOne(id, organizationId);

    return this.prisma.emailTemplateSetting.update({
      where: { id },
      data: { isActive: !template.isActive },
      include: {
        templateType: { select: { id: true, name: true, description: true } },
      },
    });
  }
}
