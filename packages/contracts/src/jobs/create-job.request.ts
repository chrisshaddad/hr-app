import { z } from 'zod';
import { jobDepartmentSchema, employmentTypeSchema } from './job-status.schema';

export const createJobRequestSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }),
  department: jobDepartmentSchema,
  employmentType: employmentTypeSchema,
  description: z.string().optional(),
  hiringManagerId: z.uuid().optional(),
});
export type CreateJobRequest = z.infer<typeof createJobRequestSchema>;
