import { z } from 'zod';

export const updateHiringStageRequestSchema = z.object({
  name: z.string().min(1, { error: 'Stage name is required' }).optional(),
  orderIndex: z.number().int().min(0).optional(),
});
export type UpdateHiringStageRequest = z.infer<
  typeof updateHiringStageRequestSchema
>;
