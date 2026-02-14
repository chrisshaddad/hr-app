import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OrganizationStatus } from '@repo/db';
import {
  type OrganizationListResponse,
  type OrganizationDetailResponse,
  organizationStatusSchema,
} from '@repo/contracts';
import { UserRole } from '@repo/db';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all organizations with optional status filter
   */
  async findAll(options: {
    status?: OrganizationStatus;
    page?: number;
    limit?: number;
  }): Promise<OrganizationListResponse> {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          website: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              users: true,
              branches: true,
            },
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { organizations, total };
  }

  /**
   * Get a single organization by ID with full details
   */
  async findOne(id: string): Promise<OrganizationDetailResponse> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        website: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            branches: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  /**
   * Approve an organization (set status to ACTIVE)
   */
  async approve(
    id: string,
    approvedById: string,
  ): Promise<OrganizationDetailResponse> {
    // Check if organization exists
    const existing = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvedById,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        website: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            branches: true,
          },
        },
      },
    });

    // Confirm org admin so that the magic link works
    if (existing.createdById) {
      await this.prisma.user.update({
        where: { id: existing.createdById },
        data: {
          isConfirmed: true,
          organizationId: id,
        },
      });
    }

    return organization;
  }

  /**
   * Reject an organization (set status to REJECTED)
   */
  async reject(id: string): Promise<OrganizationDetailResponse> {
    // Check if organization exists
    const existing = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        website: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            branches: true,
          },
        },
      },
    });

    return organization;
  }
  /**
   * Create a new organization (initially with PENDING status)
   */
  async createOrganization(data: {
    name: string;
    email: string;
    description?: string;
    website?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check if a user with this email already exists
      let user = await tx.user.findUnique({ where: { email: data.email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            name: `${data.name} Admin`,
            email: data.email,
            role: UserRole.ORG_ADMIN,
          },
        });
      }
      console.log(UserRole);

      // 2. Check if this user already has created an org
      const existingOrg = await tx.organization.findFirst({
        where: { createdById: user.id },
      });

      if (existingOrg) {
        throw new Error('You have already requested an organization');
      }

      // 3. Create the organization
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          contactEmail: data.email,
          status: OrganizationStatus.PENDING,
          description: data.description,
          website: data.website,
          createdById: user.id,
        },
      });

      // 4. Link user to org
      await tx.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id },
      });

      return {
        message: 'Organization request submitted. Awaiting approval.',
        organizationId: organization.id,
      };
    });
  }
}
