import { z } from 'zod';

export const branchInfoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type BranchInfo = z.infer<typeof branchInfoSchema>;
