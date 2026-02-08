import { z } from 'zod';
import { dateSchema } from '../common';
import { reviewTypeSchema } from './review-type.schema';
import { userMinimalSchema } from './review-assignments.response';
import { reviewCycleListItemSchema } from './review-cycles.response';

export const reviewEditableDtoSchema = z.object({
  id: z.string().uuid(),
  summary: z.string().nullable().optional(),
  strengths: z.string().nullable().optional(),
  areasToImprove: z.string().nullable().optional(),
  accomplishments: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type ReviewEditableDto = z.infer<typeof reviewEditableDtoSchema>;

export const reviewTaskItemSchema = z.object({
  assignmentId: z.string().uuid(),
  type: reviewTypeSchema,
  cycle: reviewCycleListItemSchema,
  reviewee: userMinimalSchema,
  review: reviewEditableDtoSchema.nullable(),
});

export type ReviewTaskItem = z.infer<typeof reviewTaskItemSchema>;

export const listReviewTasksResponseSchema = z.object({
  data: z.array(reviewTaskItemSchema),
  meta: z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
  }),
});

export type ListReviewTasksResponse = z.infer<typeof listReviewTasksResponseSchema>;

export const reviewFullDtoSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  cycleId: z.string().uuid(),
  type: reviewTypeSchema,
  reviewer: userMinimalSchema,
  reviewee: userMinimalSchema,
  summary: z.string().nullable().optional(),
  strengths: z.string().nullable().optional(),
  areasToImprove: z.string().nullable().optional(),
  accomplishments: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type ReviewFullDto = z.infer<typeof reviewFullDtoSchema>;

export const reviewFullDtoResponseSchema = z.object({
  data: reviewFullDtoSchema,
});

export type ReviewFullDtoResponse = z.infer<typeof reviewFullDtoResponseSchema>;

export const adminReviewListItemSchema = reviewFullDtoSchema;

export type AdminReviewListItem = z.infer<typeof adminReviewListItemSchema>;

export const listAdminReviewsResponseSchema = z.object({
  data: z.array(adminReviewListItemSchema),
  meta: z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
  }),
});

export type ListAdminReviewsResponse = z.infer<typeof listAdminReviewsResponseSchema>;

export const receivedReviewDtoSchema = z.object({
  id: z.string().uuid(),
  type: reviewTypeSchema,
  cycle: reviewCycleListItemSchema,
  summary: z.string().nullable().optional(),
  strengths: z.string().nullable().optional(),
  areasToImprove: z.string().nullable().optional(),
  accomplishments: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  reviewerDisplay: z.object({
    label: z.string(),
  }).nullable(),
});

export type ReceivedReviewDto = z.infer<typeof receivedReviewDtoSchema>;

export const listReceivedReviewsResponseSchema = z.object({
  data: z.array(receivedReviewDtoSchema),
});

export type ListReceivedReviewsResponse = z.infer<typeof listReceivedReviewsResponseSchema>;
