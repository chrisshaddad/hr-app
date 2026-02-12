import { z } from 'zod';
import { templateTypeSchema } from './template-type.schema';

export const templateListQuerySchema = z.object({
  type: templateTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;
