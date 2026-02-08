import { z } from 'zod';
import { jobDepartmentSchema, employmentTypeSchema } from './job-status.schema';

export const createJobRequestSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }),
  department: jobDepartmentSchema,
  employmentType: employmentTypeSchema,
  description: z.string().optional(),
  hiringManagerId: z.uuid().optional(),
  quantity: z
    .number()
    .int()
    .min(1, { error: 'Quantity must be at least 1' })
    .optional(),
  expectedClosingDate: z.string().optional(),
  location: z.string().optional(),
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
export type CreateJobRequest = z.infer<typeof createJobRequestSchema>;
