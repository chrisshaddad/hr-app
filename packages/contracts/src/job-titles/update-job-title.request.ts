import { z } from 'zod';

export const updateJobTitleRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateJobTitleRequest = z.infer<typeof updateJobTitleRequestSchema>;
