import { z } from 'zod';
import { dateSchema } from '../common';

const hiringStageItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  orderIndex: z.number(),
  isDefault: z.boolean(),
  isLocked: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type HiringStageItem = z.infer<typeof hiringStageItemSchema>;

export const hiringStageListResponseSchema = z.object({
  stages: z.array(hiringStageItemSchema),
  total: z.number(),
});
export type HiringStageListResponse = z.infer<
  typeof hiringStageListResponseSchema
>;
