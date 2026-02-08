import { z } from 'zod';

export const reorderHiringStagesRequestSchema = z.object({
  stages: z.array(
    z.object({
      id: z.string(),
      orderIndex: z.number().int().min(0),
    }),
  ),
});
export type ReorderHiringStagesRequest = z.infer<
  typeof reorderHiringStagesRequestSchema
>;
