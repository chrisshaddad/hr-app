import { z } from 'zod';
import { reviewTypeSchema } from './review-type.schema';

export const upsertReviewRequestSchema = z.object({
  summary: z.string().nullable().optional(),
  strengths: z.string().nullable().optional(),
  areasToImprove: z.string().nullable().optional(),
  accomplishments: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
});

export type UpsertReviewRequest = z.infer<typeof upsertReviewRequestSchema>;

export const listAdminReviewsQuerySchema = z.object({
  cycleId: z.uuid().optional(),
  type: reviewTypeSchema.optional(),
  reviewerId: z.uuid().optional(),
  revieweeId: z.uuid().optional(),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).default(20),
});

export type ListAdminReviewsQuery = z.infer<typeof listAdminReviewsQuerySchema>;

export const getReceivedReviewsQuerySchema = z.object({
  cycleId: z.uuid(),
});

export type GetReceivedReviewsQuery = z.infer<typeof getReceivedReviewsQuerySchema>;
