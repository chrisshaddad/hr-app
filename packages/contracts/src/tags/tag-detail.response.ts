import { z } from 'zod';
import { dateSchema } from '../common';

export const tagDetailResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  type: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  _count: z.object({
    candidates: z.number(),
  }),
});
export type TagDetailResponse = z.infer<typeof tagDetailResponseSchema>;
