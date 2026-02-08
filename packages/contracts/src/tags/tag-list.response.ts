import { z } from 'zod';
import { dateSchema } from '../common';

const tagListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  type: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  _count: z.object({
    candidates: z.number(),
  }),
});
export type TagListItem = z.infer<typeof tagListItemSchema>;

export const tagListResponseSchema = z.object({
  tags: z.array(tagListItemSchema),
  total: z.number(),
});
export type TagListResponse = z.infer<typeof tagListResponseSchema>;
