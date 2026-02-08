import { z } from 'zod';
import {
  jobStatusSchema,
  jobDepartmentSchema,
  employmentTypeSchema,
} from './job-status.schema';
import { dateSchema } from '../common';

const jobListItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  department: jobDepartmentSchema,
  employmentType: employmentTypeSchema,
  status: jobStatusSchema,
  description: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  hiringManager: z
    .object({
      id: z.uuid(),
      name: z.string(),
      email: z.email(),
    })
    .nullable(),
  _count: z.object({
    applications: z.number(),
  }),
});
export type JobListItem = z.infer<typeof jobListItemSchema>;

export const jobListResponseSchema = z.object({
  jobs: z.array(jobListItemSchema),
  total: z.number(),
});
export type JobListResponse = z.infer<typeof jobListResponseSchema>;
