import { z } from 'zod';
import { branchDetailResponseSchema } from './branch-detail.response';

export const branchListResponseSchema = z.object({
  data: z.array(branchDetailResponseSchema),

  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  }),
});

export type BranchListResponse = z.infer<typeof branchListResponseSchema>;
