import { z } from 'zod';

export const createJobTitleRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateJobTitleRequest = z.infer<typeof createJobTitleRequestSchema>;
