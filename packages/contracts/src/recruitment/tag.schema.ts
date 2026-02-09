import { z } from 'zod';
import { dateSchema } from '../common';

export const tagCreateRequestSchema = z.object({
  name: z.string().min(1).max(255),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  description: z.string().optional(),
});

export type TagCreateRequest = z.infer<typeof tagCreateRequestSchema>;

export const tagDetailResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: dateSchema,
});

export type TagDetailResponse = z.infer<typeof tagDetailResponseSchema>;

export const tagListResponseSchema = z.object({
  data: z.array(tagDetailResponseSchema),
  total: z.number(),
});

export type TagListResponse = z.infer<typeof tagListResponseSchema>;
