import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EmailTemplateTypesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all available email template types
   */
  async findAll() {
    return this.prisma.emailTemplateType.findMany({
      include: {
        _count: { select: { templateSettings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a specific template type by ID
   */
  async findOne(id: string) {
    const templateType = await this.prisma.emailTemplateType.findUnique({
      where: { id },
      include: {
        _count: { select: { templateSettings: true } },
      },
    });

    if (!templateType) {
      throw new NotFoundException('Email template type not found');
    }

    return templateType;
  }
}
