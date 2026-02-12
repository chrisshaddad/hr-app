import { z } from 'zod';
import { dateSchema } from '../common';
import { taskStatusSchema } from './task-status.schema';
import { taskTypeSchema } from './task-type.schema';

export const taskSchema = z.object({
  id: z.uuid(),
  checklistId: z.uuid().nullable(),
  employeeId: z.uuid(),
  assigneeId: z.uuid().nullable(),
  templateTaskId: z.uuid().nullable(),
  order: z.number().int(),
  name: z.string(),
  taskType: taskTypeSchema,
  status: taskStatusSchema,
  dueDate: dateSchema.nullable(),
  description: z.string().nullable(),
  createdById: z.uuid().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Task = z.infer<typeof taskSchema>;
