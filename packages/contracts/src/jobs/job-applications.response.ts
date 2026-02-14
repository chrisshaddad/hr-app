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
    phone: z.string().nullable(),
    communicationCount: z.number().int().min(0),
  }),
});

export const jobApplicationsResponseSchema = z.object({
  applications: z.array(jobApplicationItemSchema),
});

export type JobApplicationItem = z.infer<typeof jobApplicationItemSchema>;
export type JobApplicationsResponse = z.infer<
  typeof jobApplicationsResponseSchema
>;
