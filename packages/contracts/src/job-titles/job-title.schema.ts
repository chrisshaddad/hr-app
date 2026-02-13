import { z } from 'zod';
import { dateSchema } from '../common';

export const jobTitleSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type JobTitle = z.infer<typeof jobTitleSchema>;

export const jobTitleResponseSchema = jobTitleSchema.extend({
  _count: z
    .object({
      employments: z.number(),
    })
    .optional(),
});

export type JobTitleResponse = z.infer<typeof jobTitleResponseSchema>;

export const jobTitleListResponseSchema = z.object({
  jobTitles: z.array(jobTitleResponseSchema),
  total: z.number(),
});

export type JobTitleListResponse = z.infer<typeof jobTitleListResponseSchema>;
