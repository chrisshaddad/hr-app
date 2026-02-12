import { z } from 'zod';
import { taskTypeSchema } from './task-type.schema';

export const templateTaskUpdateRequestSchema = z.object({
  order: z
    .number()
    .int()
    .positive('Order must be a positive integer')
    .optional(),
  name: z.string().min(1, 'Task name is required').optional(),
  taskType: taskTypeSchema.optional(),
  description: z.string().nullable().optional(),
  dueInDays: z.number().int().nullable().optional(),
});

export type TemplateTaskUpdateRequest = z.infer<
  typeof templateTaskUpdateRequestSchema
>;
