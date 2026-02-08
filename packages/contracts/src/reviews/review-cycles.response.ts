import { z } from 'zod';
import { dateSchema } from '../common';

export const reviewCycleDetailsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: dateSchema,
  endDate: dateSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type ReviewCycleDetails = z.infer<typeof reviewCycleDetailsSchema>;

export const reviewCycleListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: dateSchema,
  endDate: dateSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type ReviewCycleListItem = z.infer<typeof reviewCycleListItemSchema>;

export const listReviewCyclesResponseSchema = z.object({
  data: z.array(reviewCycleListItemSchema),
  meta: z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
  }),
});

export type ListReviewCyclesResponse = z.infer<typeof listReviewCyclesResponseSchema>;

export const reviewCycleDetailResponseSchema = z.object({
  data: reviewCycleDetailsSchema,
});

export type ReviewCycleDetailResponse = z.infer<typeof reviewCycleDetailResponseSchema>;
