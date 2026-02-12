import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all tags for an organization
   */
  async findAll(
    organizationId: string,
    options: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 20, search } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [tags, total] = await Promise.all([
      this.prisma.tagSetting.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { candidates: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.tagSetting.count({ where }),
    ]);

    return {
      data: tags,
      total,
      page,
      limit,
      hasMore: skip + tags.length < total,
    };
  }

  /**
   * Find a specific tag by ID
   */
  async findOne(id: string, organizationId: string) {
    const tag = await this.prisma.tagSetting.findUnique({
      where: { id },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  /**
   * Create a new tag
   */
  async create(
    organizationId: string,
    data: {
      name: string;
      color?: string;
      description?: string;
    },
  ) {
    // Check for name uniqueness
    const existing = await this.prisma.tagSetting.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new BadRequestException('A tag with this name already exists');
    }

    // Validate hex color if provided
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      throw new BadRequestException(
        'Color must be a valid hex code (e.g., #FF0000)',
      );
    }

    return this.prisma.tagSetting.create({
      data: {
        name: data.name,
        color: data.color || '#000000',
        description: data.description || null,
      },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Update a tag
   */
  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      color?: string;
      description?: string;
    },
  ) {
    const tag = await this.findOne(id, organizationId);

    // Check for name uniqueness if name is being updated
    if (data.name && data.name !== tag.name) {
      const existing = await this.prisma.tagSetting.findFirst({
        where: {
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('A tag with this name already exists');
      }
    }

    // Validate hex color if provided
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      throw new BadRequestException(
        'Color must be a valid hex code (e.g., #FF0000)',
      );
    }

    return this.prisma.tagSetting.update({
      where: { id },
      data: {
        name: data.name ?? tag.name,
        color: data.color ?? tag.color,
        description: data.description ?? tag.description,
      },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Delete a tag
   */
  async delete(id: string, organizationId: string) {
    const tag = await this.findOne(id, organizationId);

    // Prisma will automatically handle cascade deletion of tag-candidate associations
    return this.prisma.tagSetting.delete({
      where: { id },
    });
  }

  /**
   * Search tags by name
   */
  async search(organizationId: string, query: string, take: number = 10) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return this.prisma.tagSetting.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take,
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
  }

  /**
   * Bulk create tags
   */
  async bulkCreate(
    organizationId: string,
    tags: Array<{
      name: string;
      color?: string;
      description?: string;
    }>,
  ) {
    const created = [] as any[];
    const errors = [] as { name?: string; error?: string }[];

    for (const tag of tags) {
      try {
        const result = await this.create(organizationId, tag);
        created.push(result);
      } catch (error) {
        errors.push({
          name: tag.name,
          error: (error as Error).message,
        });
      }
    }

    return {
      created,
      errors,
      total: tags.length,
      successCount: created.length,
      errorCount: errors.length,
    };
  }
}
