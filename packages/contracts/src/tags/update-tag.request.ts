import { z } from 'zod';

export const updateTagRequestSchema = z.object({
  name: z.string().min(1, { error: 'Tag name is required' }).optional(),
  type: z.string().nullable().optional(),
});
export type UpdateTagRequest = z.infer<typeof updateTagRequestSchema>;
