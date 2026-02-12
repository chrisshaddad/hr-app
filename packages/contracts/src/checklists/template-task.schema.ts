import { z } from 'zod';
import { dateSchema } from '../common';
import { taskTypeSchema } from './task-type.schema';

export const templateTaskSchema = z.object({
  id: z.uuid(),
  templateId: z.uuid(),
  order: z.number().int(),
  name: z.string(),
  taskType: taskTypeSchema,
  description: z.string().nullable(),
  dueInDays: z.number().int().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type TemplateTask = z.infer<typeof templateTaskSchema>;
