import { z } from 'zod';
import {
  jobStatusSchema,
  jobDepartmentSchema,
  employmentTypeSchema,
  applicationStageSchema,
} from './job-status.schema';
import { dateSchema } from '../common';

const candidateInApplicationSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  resumeUrl: z.string().nullable(),
});

const applicationInJobSchema = z.object({
  id: z.uuid(),
  currentStage: applicationStageSchema,
  source: z.string().nullable(),
  appliedAt: dateSchema,
  candidate: candidateInApplicationSchema,
  _count: z.object({
    interviews: z.number(),
    communications: z.number(),
  }),
});
export type ApplicationInJob = z.infer<typeof applicationInJobSchema>;

export const jobDetailResponseSchema = z.object({
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
  applications: z.array(applicationInJobSchema),
  _count: z.object({
    applications: z.number(),
  }),
});
export type JobDetailResponse = z.infer<typeof jobDetailResponseSchema>;
