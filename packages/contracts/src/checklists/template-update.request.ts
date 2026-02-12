import { z } from 'zod';

export const templateUpdateRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Template name is required' })
    .optional(),
  description: z.string().trim().optional(),
});

export type TemplateUpdateRequest = z.infer<typeof templateUpdateRequestSchema>;
