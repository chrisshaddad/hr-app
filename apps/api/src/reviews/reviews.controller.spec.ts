import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { UserRole } from '@repo/db';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockReviewsService = {
    listReviewCycles: jest.fn(),
    getReviewCycle: jest.fn(),
    createReviewCycle: jest.fn(),
    updateReviewCycle: jest.fn(),
    listReviewAssignments: jest.fn(),
    bulkCreateReviewAssignments: jest.fn(),
    deleteReviewAssignment: jest.fn(),
    getMyReviewTasks: jest.fn(),
    upsertReview: jest.fn(),
    getReview: jest.fn(),
    listAdminReviews: jest.fn(),
    getReceivedReviews: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Review Cycles', () => {
    it('should list review cycles for any authenticated user', async () => {
      const mockCycles = {
        data: [{ id: 'cycle-1', name: 'Q1 Review' }],
        meta: { page: 0, size: 20, total: 1 },
      };

      mockReviewsService.listReviewCycles.mockResolvedValue(mockCycles);

      const user = { id: 'user-1', organizationId: 'org-1', role: UserRole.EMPLOYEE } as any;
      const result = await controller.listReviewCycles(user, { page: 0, size: 20 });

      expect(result).toEqual(mockCycles);
      expect(service.listReviewCycles).toHaveBeenCalledWith('org-1', {
        page: 0,
        size: 20,
      });
    });

    it('should get single review cycle for any authenticated user', async () => {
      const mockCycle = {
        id: 'cycle-1',
        name: 'Q1 Review',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
      };

      mockReviewsService.getReviewCycle.mockResolvedValue(mockCycle);

      const user = { id: 'user-1', organizationId: 'org-1', role: UserRole.EMPLOYEE } as any;
      const result = await controller.getReviewCycle(user, 'cycle-1');

      expect(result.data).toEqual(mockCycle);
    });
  });

  describe('Review Assignments', () => {
    it('should list review assignments for any authenticated user', async () => {
      const mockAssignments = {
        data: [],
        meta: { page: 0, size: 20, total: 0 },
      };

      mockReviewsService.listReviewAssignments.mockResolvedValue(mockAssignments);

      const user = { id: 'user-1', organizationId: 'org-1', role: UserRole.EMPLOYEE } as any;
      const result = await controller.listReviewAssignments(user, { page: 0, size: 20 });

      expect(result).toEqual(mockAssignments);
    });
  });

  describe('Authorization - Admin Only Endpoints', () => {
    // Note: Actual guard testing is done in integration tests.
    // These tests verify the service is called correctly when reached.

    it('bulk create should call service with org context', async () => {
      mockReviewsService.bulkCreateReviewAssignments.mockResolvedValue({
        data: {
          createdCount: 5,
          skippedCount: 0,
          createdAssignmentIds: [],
          warnings: [],
        },
      });

      const user = { id: 'admin-1', organizationId: 'org-1', role: UserRole.ORG_ADMIN } as any;
      const dto = {
        cycleId: 'cycle-1',
        self: { enabled: true, revieweeIds: ['emp-1'] },
      };

      const result = await controller.bulkCreateReviewAssignments(user, dto);

      expect(service.bulkCreateReviewAssignments).toHaveBeenCalledWith('org-1', dto);
      expect(result.data.createdCount).toBe(5);
    });

    it('delete assignment should call service with org context', async () => {
      mockReviewsService.deleteReviewAssignment.mockResolvedValue(undefined);

      const user = { id: 'admin-1', organizationId: 'org-1', role: UserRole.ORG_ADMIN } as any;

      await controller.deleteReviewAssignment(user, 'assign-1');

      expect(service.deleteReviewAssignment).toHaveBeenCalledWith('assign-1', 'org-1');
    });

    it('list admin reviews should call service with org context', async () => {
      mockReviewsService.listAdminReviews.mockResolvedValue({
        data: [],
        meta: { page: 0, size: 20, total: 0 },
      });

      const user = { id: 'admin-1', organizationId: 'org-1', role: UserRole.ORG_ADMIN } as any;

      const result = await controller.listAdminReviews(user, { page: 0, size: 20 });

      expect(service.listAdminReviews).toHaveBeenCalledWith('org-1', {
        page: 0,
        size: 20,
      });
    });
  });

  describe('Review Submission and Feedback', () => {
    it('should allow authenticated user to upsert their own review', async () => {
      const mockReview = {
        id: 'review-1',
        summary: 'Great work',
        rating: 5,
        createdAt: '2025-02-08',
        updatedAt: '2025-02-08',
      };

      mockReviewsService.upsertReview.mockResolvedValue(mockReview);

      const user = { id: 'user-1', organizationId: 'org-1' } as any;
      const result = await controller.upsertReview(user, 'assign-1', {
        summary: 'Great work',
        rating: 5,
      });

      expect(result.data).toEqual(mockReview);
      expect(service.upsertReview).toHaveBeenCalledWith('assign-1', 'org-1', 'user-1', {
        summary: 'Great work',
        rating: 5,
      });
    });

    it('should allow authenticated user to view received feedback', async () => {
      const mockFeedback = {
        data: [
          {
            id: 'review-1',
            type: 'PEER',
            reviewerDisplay: null, // Anonymized
            summary: 'Good communication skills',
          },
        ],
      };

      mockReviewsService.getReceivedReviews.mockResolvedValue(mockFeedback);

      const user = { id: 'user-1', organizationId: 'org-1' } as any;
      const result = await controller.getReceivedReviews(user, { cycleId: 'cycle-1' });

      const first = result.data?.[0];
      expect(first).toBeDefined();

      expect(first!.reviewerDisplay).toBeNull(); // PEER review is anonymized
      expect(service.getReceivedReviews).toHaveBeenCalledWith('org-1', 'user-1', {
        cycleId: 'cycle-1',
      });
    });
  });
});
