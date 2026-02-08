import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@repo/db';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  const mockPrisma = {
    reviewCycle: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    reviewAssignment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  };

  const mockOrgId = 'org-123';
  const mockUserId = 'user-123';
  const mockManagerId = 'manager-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization - Review Assignments', () => {
    it('should filter assignments for EMPLOYEE to show only their own', async () => {
      const mockAssignments = [
        {
          id: 'assign-1',
          cycleId: 'cycle-1',
          reviewerId: mockUserId,
          type: 'PEER',
          createdAt: new Date(),
          updatedAt: new Date(),
          cycle: {
            id: 'cycle-1',
            name: 'Q1 Review',
            startDate: new Date(),
            endDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          reviewer: { id: mockUserId, name: 'John', email: 'john@test.com' },
          reviewee: { id: 'user-456', name: 'Jane', email: 'jane@test.com', departmentId: null },
          review: null,
        },
      ];

      mockPrisma.reviewAssignment.findMany.mockResolvedValue(mockAssignments);
      mockPrisma.reviewAssignment.count.mockResolvedValue(1);

      const employee = { id: mockUserId, role: UserRole.EMPLOYEE, organizationId: mockOrgId } as any;
      const result = await service.listReviewAssignments(mockOrgId, employee, {
        page: 0,
        size: 20,
      });

      expect(mockPrisma.reviewAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reviewerId: mockUserId,
          }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should allow ORG_ADMIN to filter by reviewerId', async () => {
      const mockAssignments = [];
      mockPrisma.reviewAssignment.findMany.mockResolvedValue(mockAssignments);
      mockPrisma.reviewAssignment.count.mockResolvedValue(0);

      const admin = { id: 'admin-1', role: UserRole.ORG_ADMIN, organizationId: mockOrgId } as any;
      await service.listReviewAssignments(mockOrgId, admin, {
        page: 0,
        size: 20,
        reviewerId: 'some-reviewer-id',
      });

      expect(mockPrisma.reviewAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reviewerId: 'some-reviewer-id',
          }),
        }),
      );
    });
  });

  describe('Authorization - Upsert Review', () => {
    it('should reject review submission from non-reviewer', async () => {
      const assignment = {
        id: 'assign-1',
        cycleId: 'cycle-1',
        reviewerId: 'reviewer-123',
        revieweeId: 'employee-456',
        cycle: {
          startDate: new Date(Date.now() - 86400000), // yesterday
          endDate: new Date(Date.now() + 86400000), // tomorrow
        },
      };

      mockPrisma.reviewAssignment.findFirst.mockResolvedValue(assignment);

      const user = { id: mockUserId, organizationId: mockOrgId } as any;
      await expect(
        service.upsertReview('assign-1', mockOrgId, user.id, {
          summary: 'Great work',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject review submission outside cycle window', async () => {
      const assignment = {
        id: 'assign-1',
        cycleId: 'cycle-1',
        reviewerId: mockUserId,
        revieweeId: 'employee-456',
        cycle: {
          startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
          endDate: new Date(Date.now() - 86400000), // yesterday (ended)
        },
      };

      mockPrisma.reviewAssignment.findFirst.mockResolvedValue(assignment);

      const user = { id: mockUserId, organizationId: mockOrgId } as any;
      await expect(
        service.upsertReview('assign-1', mockOrgId, user.id, {
          summary: 'Late feedback',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow review submission within cycle window', async () => {
      const assignment = {
        id: 'assign-1',
        cycleId: 'cycle-1',
        reviewerId: mockUserId,
        revieweeId: 'employee-456',
        type: 'MANAGER',
        cycle: {
          startDate: new Date(Date.now() - 86400000), // yesterday
          endDate: new Date(Date.now() + 86400000), // tomorrow
        },
      };

      const createdReview = {
        id: 'review-1',
        summary: 'Good performance',
        strengths: 'Great communication',
        areasToImprove: 'Time management',
        accomplishments: 'Completed project x',
        rating: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.reviewAssignment.findFirst.mockResolvedValue(assignment);
      mockPrisma.review.upsert.mockResolvedValue(createdReview);

      const user = { id: mockUserId, organizationId: mockOrgId } as any;
      const result = await service.upsertReview('assign-1', mockOrgId, user.id, {
        summary: 'Good performance',
        rating: 4,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('review-1');
    });
  });

  describe('Anonymization - Received Reviews', () => {
    it('should return null for reviewerDisplay in PEER reviews', async () => {
      const cycle = {
        id: 'cycle-1',
        name: 'Q1 Review',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() - 86400000), // ended
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reviews = [
        {
          id: 'review-1',
          type: 'PEER',
          revieweeId: mockUserId,
          reviewer: { id: 'peer-reviewer', name: 'John', email: 'john@test.com' },
          cycle,
          summary: 'Good work',
          strengths: 'Strong skills',
          areasToImprove: null,
          accomplishments: null,
          rating: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.reviewCycle.findFirst.mockResolvedValue(cycle);
      mockPrisma.review.findMany.mockResolvedValue(reviews);

      const result = await service.getReceivedReviews(mockOrgId, mockUserId, {
        cycleId: 'cycle-1',
      });

      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);

      const first = result.data?.[0];
      expect(first).toBeDefined();

      expect(first!.reviewerDisplay).toBeNull();


    });

    it('should return "You" for SELF reviews', async () => {
      const cycle = {
        id: 'cycle-1',
        name: 'Q1 Review',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() - 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reviews = [
        {
          id: 'review-1',
          type: 'SELF',
          revieweeId: mockUserId,
          reviewer: { id: mockUserId, name: 'Self', email: 'self@test.com' },
          cycle,
          summary: 'Self assessment',
          strengths: null,
          areasToImprove: null,
          accomplishments: null,
          rating: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.reviewCycle.findFirst.mockResolvedValue(cycle);
      mockPrisma.review.findMany.mockResolvedValue(reviews);

      const result = await service.getReceivedReviews(mockOrgId, mockUserId, {
        cycleId: 'cycle-1',
      });

      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);

      const first = result.data?.[0];
      expect(first).toBeDefined();

      expect(first!.reviewerDisplay).toEqual({ label: 'You' });
    });

    it('should enforce cycle must be ended before viewing feedback', async () => {
      const cycle = {
        id: 'cycle-1',
        name: 'Q1 Review',
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000), // not ended yet
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.reviewCycle.findFirst.mockResolvedValue(cycle);

      const user = { id: mockUserId, organizationId: mockOrgId } as any;
      await expect(
        service.getReceivedReviews(mockOrgId, user.id, { cycleId: 'cycle-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Bulk Create Assignments', () => {
    it('should skip users that do not have managers for MANAGER assignment type', async () => {
      const cycle = {
        id: 'cycle-1',
        name: 'Q1',
        startDate: new Date(),
        endDate: new Date(),
      };

      const user = { id: 'emp-1', managerId: null }; // No manager

      mockPrisma.reviewCycle.findFirst.mockResolvedValue(cycle);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        mockPrisma.user.findFirst.mockResolvedValue(user);
        return fn(mockPrisma);
      });

      const result = await service.bulkCreateReviewAssignments(mockOrgId, {
        cycleId: 'cycle-1',
        manager: {
          enabled: true,
          revieweeIds: ['emp-1'],
        },
      });

      expect(result.data.skippedCount).toBe(1);
      expect(result.data.warnings).toContainEqual(
        expect.objectContaining({
          code: 'NO_MANAGER',
        }),
      );
    });
  });
});
