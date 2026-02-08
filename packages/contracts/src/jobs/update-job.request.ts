import { z } from 'zod';
import {
  jobStatusSchema,
  jobDepartmentSchema,
  employmentTypeSchema,
} from './job-status.schema';

export const updateJobRequestSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }).optional(),
  department: jobDepartmentSchema.optional(),
  employmentType: employmentTypeSchema.optional(),
  description: z.string().nullable().optional(),
  status: jobStatusSchema.optional(),
  hiringManagerId: z.uuid().nullable().optional(),
  quantity: z
    .number()
    .int()
    .min(1, { error: 'Quantity must be at least 1' })
    .optional(),
  expectedClosingDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  tagIds: z.array(z.uuid()).optional(),
  hiringStages: z
    .array(
      z.object({
        hiringStageId: z.uuid(),
        orderIndex: z.number(),
      }),
    )
    .optional(),
});
export type UpdateJobRequest = z.infer<typeof updateJobRequestSchema>;
