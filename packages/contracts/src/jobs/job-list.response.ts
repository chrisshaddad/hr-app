import { z } from 'zod';

import { jobResponseSchema } from './job.response';

export const jobListResponseSchema = z.object({
  jobs: z.array(jobResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type JobListResponse = z.infer<typeof jobListResponseSchema>;
