import { z } from 'zod';
import { dateSchema } from '../common';

export const checklistSchema = z.object({
  id: z.uuid(),
  templateId: z.uuid(),
  employeeId: z.uuid(),
  startDate: dateSchema.nullable(),
  dueDate: dateSchema.nullable(),
  completedAt: dateSchema.nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Checklist = z.infer<typeof checklistSchema>;
