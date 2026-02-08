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
});
export type UpdateJobRequest = z.infer<typeof updateJobRequestSchema>;
