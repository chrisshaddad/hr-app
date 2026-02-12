import { z } from 'zod';
import { templateTypeSchema } from './template-type.schema';

export const templateCreateRequestSchema = z.object({
  type: templateTypeSchema,
  name: z.string().trim().min(1, { error: 'Template name is required' }),
  description: z.string().trim().min(1).optional(),
});

export type TemplateCreateRequest = z.infer<typeof templateCreateRequestSchema>;
