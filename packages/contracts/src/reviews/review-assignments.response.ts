import { z } from 'zod';
import { dateSchema } from '../common';
import { reviewTypeSchema } from './review-type.schema';
import { reviewCycleListItemSchema } from './review-cycles.response';

export const userMinimalSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
});

export type UserMinimal = z.infer<typeof userMinimalSchema>;

export const reviewAssignmentListItemSchema = z.object({
  id: z.uuid(),
  cycle: reviewCycleListItemSchema,
  type: reviewTypeSchema,
  reviewer: userMinimalSchema,
  reviewee: userMinimalSchema.extend({
    departmentId: z.uuid().optional().nullable(),
  }),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  hasReview: z.boolean(),
});

export type ReviewAssignmentListItem = z.infer<typeof reviewAssignmentListItemSchema>;

export const listReviewAssignmentsResponseSchema = z.object({
  data: z.array(reviewAssignmentListItemSchema),
  meta: z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
  }),
});

export type ListReviewAssignmentsResponse = z.infer<typeof listReviewAssignmentsResponseSchema>;

export const bulkCreateReviewAssignmentsResponseSchema = z.object({
  data: z.object({
    createdCount: z.number(),
    skippedCount: z.number(),
    createdAssignmentIds: z.array(z.uuid()),
    warnings: z.array(z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    })),
  }),
});

export type BulkCreateReviewAssignmentsResponse = z.infer<typeof bulkCreateReviewAssignmentsResponseSchema>;
