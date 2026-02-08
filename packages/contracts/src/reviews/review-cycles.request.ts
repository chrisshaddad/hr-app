import { z } from 'zod';

export const listReviewCyclesQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).default(20),
  activeOnly: z.coerce.boolean().optional(),
});

export type ListReviewCyclesQuery = z.infer<typeof listReviewCyclesQuerySchema>;

export const createReviewCycleRequestSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export type CreateReviewCycleRequest = z.infer<typeof createReviewCycleRequestSchema>;

export const updateReviewCycleRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export type UpdateReviewCycleRequest = z.infer<typeof updateReviewCycleRequestSchema>;
