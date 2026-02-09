import { z } from 'zod';
import { jobListingDetailResponseSchema } from './job-listing-detail.response';

export const jobListingListResponseSchema = z.object({
  data: z.array(jobListingDetailResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type JobListingListResponse = z.infer<
  typeof jobListingListResponseSchema
>;
