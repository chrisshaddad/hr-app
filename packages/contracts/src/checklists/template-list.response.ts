import { z } from 'zod';
import { templateSchema } from './template.schema';

export const templateListResponseSchema = z.object({
  templates: z.array(templateSchema),
  total: z.number(),
});

export type TemplateListResponse = z.infer<typeof templateListResponseSchema>;
