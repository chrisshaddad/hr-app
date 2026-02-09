import { z } from 'zod';
import { candidateDetailResponseSchema } from './candidate-detail.response';

export const candidateListResponseSchema = z.object({
  data: z.array(candidateDetailResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type CandidateListResponse = z.infer<typeof candidateListResponseSchema>;
