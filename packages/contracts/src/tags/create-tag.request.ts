import { z } from 'zod';

export const createTagRequestSchema = z.object({
  name: z.string().min(1, { error: 'Tag name is required' }),
  type: z.string().optional(),
});
export type CreateTagRequest = z.infer<typeof createTagRequestSchema>;
