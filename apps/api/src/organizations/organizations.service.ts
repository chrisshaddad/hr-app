import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { OrganizationStatus } from '@repo/db';
import type {
  OrganizationListResponse,
  OrganizationDetailResponse,
} from '@repo/contracts';

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
          User_Organization_createdByIdToUser: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              User_User_organizationIdToOrganization: true,
              Branch: true,
            },
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      organizations: organizations.map((org) => ({
        ...org,
        createdBy: org.User_Organization_createdByIdToUser,
        _count: {
          users: org._count.User_User_organizationIdToOrganization,
          branches: org._count.Branch,
        },
      })),
      total,
    };
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
        User_Organization_createdByIdToUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        User_Organization_approvedByIdToUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            User_User_organizationIdToOrganization: true,
            Branch: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return {
      ...organization,
      createdBy: organization.User_Organization_createdByIdToUser,
      approvedBy: organization.User_Organization_approvedByIdToUser,
      _count: {
        users: organization._count.User_User_organizationIdToOrganization,
        branches: organization._count.Branch,
      },
    };
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
        User_Organization_createdByIdToUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        User_Organization_approvedByIdToUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            User_User_organizationIdToOrganization: true,
            Branch: true,
          },
        },
      },
    });

    return {
      ...organization,
      createdBy: organization.User_Organization_createdByIdToUser,
      approvedBy: organization.User_Organization_approvedByIdToUser,
      _count: {
        users: organization._count.User_User_organizationIdToOrganization,
        branches: organization._count.Branch,
      },
    };
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
        User_Organization_createdByIdToUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        User_Organization_approvedByIdToUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            User_User_organizationIdToOrganization: true,
            Branch: true,
          },
        },
      },
    });

    return {
      ...organization,
      createdBy: organization.User_Organization_createdByIdToUser,
      approvedBy: organization.User_Organization_approvedByIdToUser,
      _count: {
        users: organization._count.User_User_organizationIdToOrganization,
        branches: organization._count.Branch,
      },
    };
  }
}
