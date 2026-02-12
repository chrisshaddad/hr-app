import { z } from 'zod';
import { reviewTypeSchema } from './review-type.schema';

export const listReviewAssignmentsQuerySchema = z.object({
  cycleId: z.uuid().optional(),
  type: reviewTypeSchema.optional(),
  revieweeId: z.uuid().optional(),
  reviewerId: z.uuid().optional(),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).default(20),
});

export type ListReviewAssignmentsQuery = z.infer<typeof listReviewAssignmentsQuerySchema>;

export const bulkCreateReviewAssignmentsRequestSchema = z.object({
  cycleId: z.uuid(),
  self: z.object({
    enabled: z.boolean(),
    revieweeIds: z.array(z.uuid()).default([]),
  }).optional(),
  manager: z.object({
    enabled: z.boolean(),
    revieweeIds: z.array(z.uuid()).default([]),
  }).optional(),
  peer: z.object({
    enabled: z.boolean(),
    pairs: z.array(z.object({
      revieweeId: z.uuid(),
      reviewerIds: z.array(z.uuid()),
    })).default([]),
  }).optional(),
});

export type BulkCreateReviewAssignmentsRequest = z.infer<typeof bulkCreateReviewAssignmentsRequestSchema>;
