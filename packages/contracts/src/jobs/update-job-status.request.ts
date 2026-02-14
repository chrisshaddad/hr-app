import { z } from 'zod';

export const updateJobStatusRequestSchema = z.object({
  status: z.enum(['draft', 'published', 'closed']),
});

export type UpdateJobStatusRequest = z.infer<
  typeof updateJobStatusRequestSchema
>;
