import { z } from 'zod';
import { dateSchema } from '../common';

const branchListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  city: z.string().nullable(),
  country: z.string(),
  createdAt: dateSchema,
});
export type BranchListItem = z.infer<typeof branchListItemSchema>;

export const branchListResponseSchema = z.object({
  branches: z.array(branchListItemSchema),
  total: z.number(),
});
export type BranchListResponse = z.infer<typeof branchListResponseSchema>;
