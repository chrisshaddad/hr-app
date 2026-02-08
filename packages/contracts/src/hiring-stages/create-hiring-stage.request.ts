import { z } from 'zod';

export const createHiringStageRequestSchema = z.object({
  name: z.string().min(1, { error: 'Stage name is required' }),
  orderIndex: z
    .number()
    .int()
    .min(0, { error: 'Order index must be non-negative' }),
  isLocked: z.boolean().optional(),
});
export type CreateHiringStageRequest = z.infer<
  typeof createHiringStageRequestSchema
>;
