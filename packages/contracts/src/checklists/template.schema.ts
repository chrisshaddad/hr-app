import { z } from 'zod';
import { dateSchema } from '../common';
import { templateTypeSchema } from './template-type.schema';

export const templateSchema = z.object({
  id: z.uuid(),
  type: templateTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  organizationId: z.uuid(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Template = z.infer<typeof templateSchema>;
