import { z } from 'zod';

import { dateSchema } from '../common';

const applicationStatusSchema = z.enum([
  'HIRED',
  'OFFERED',
  'APPLIED',
  'REJECTED',
  'SCREENING',
  'FIRST_INTERVIEW',
  'SECOND_INTERVIEW',
]);

export const jobApplicationItemSchema = z.object({
  applicationId: z.string().uuid(),
  status: applicationStatusSchema,
  appliedAt: dateSchema,
  candidate: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
  }),
});

export const jobApplicationsResponseSchema = z.object({
  applications: z.array(jobApplicationItemSchema),
});

export type JobApplicationItem = z.infer<typeof jobApplicationItemSchema>;
export type JobApplicationsResponse = z.infer<
  typeof jobApplicationsResponseSchema
>;
