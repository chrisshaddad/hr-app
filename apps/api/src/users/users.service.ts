import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  UserCreateRequest,
  UserUpdateRequest,
  UserListResponse,
  UserResponse,
  UserProfileUpdateRequest,
  UserProfileResponse,
} from '@repo/contracts';
import type { User } from '@repo/db';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      departmentId?: string;
    } = {},
  ): Promise<UserListResponse> {
    const { page = 1, limit = 20, departmentId } = options;
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      ...(departmentId && { departmentId }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          departmentId: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      hasMore: skip + users.length < total,
    };
  }

  async findOne(id: string, organizationId?: string): Promise<User> {
    const where: any = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (organizationId && user.organizationId !== organizationId) {
      throw new NotFoundException(
        `User with ID ${id} not found in organization ${organizationId}`,
      );
    }

    return user;
  }

  async create(organizationId: string, data: UserCreateRequest): Promise<User> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Verify department exists in organization if departmentId provided
    if (data.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
        include: { branch: true },
      });

      if (!department || department.branch.organizationId !== organizationId) {
        throw new BadRequestException(
          'Department not found in this organization',
        );
      }
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        organizationId,
        departmentId: data.departmentId || null,
        role: 'EMPLOYEE',
        isConfirmed: false,
      },
    });

    return user;
  }

  async update(
    id: string,
    organizationId: string,
    data: UserUpdateRequest,
  ): Promise<User> {
    // Verify user exists in organization
    const user = await this.findOne(id, organizationId);

    // If updating department, verify it exists in organization
    if (data.departmentId !== undefined) {
      const department = await this.prisma.department.findUnique({
        where: { id: data.departmentId! },
        include: { branch: true },
      });

      if (!department || department.branch.organizationId !== organizationId) {
        throw new BadRequestException(
          'Department not found in this organization',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.departmentId !== undefined && {
          departmentId: data.departmentId,
        }),
      },
    });

    return updatedUser;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    // Verify user exists in organization
    await this.findOne(id, organizationId);

    // Delete user (this also cascades to password, sessions, magic links)
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Profile methods
  async getProfile(userId: string): Promise<UserProfileResponse | null> {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async updateProfile(
    userId: string,
    data: UserProfileUpdateRequest,
  ): Promise<UserProfileResponse> {
    // Ensure user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create or update profile
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return profile;
  }
}
