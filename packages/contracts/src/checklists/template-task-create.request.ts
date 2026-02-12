import { z } from 'zod';
import { taskTypeSchema } from './task-type.schema';

export const templateTaskCreateRequestSchema = z.object({
  order: z.number().int().positive('Order must be a positive integer'),
  name: z.string().min(1, 'Task name is required'),
  taskType: taskTypeSchema,
  description: z.string().nullable().optional(),
  dueInDays: z.number().int().nullable().optional(),
});

export type TemplateTaskCreateRequest = z.infer<
  typeof templateTaskCreateRequestSchema
>;
