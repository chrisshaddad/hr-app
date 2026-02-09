import { z } from 'zod';
import { dateSchema } from '../common';
import { jobListingStatusSchema, employmentTypeSchema } from './enums.schema';

export const jobListingDetailResponseSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  departmentId: z.string().uuid(),
  officeId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  status: jobListingStatusSchema,
  employmentType: employmentTypeSchema,
  openingsQuantity: z.number(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string(),
  experienceYears: z.number().nullable(),
  educationLevel: z.string().nullable(),
  skills: z.array(z.string()),
  benefits: z.array(z.string()),
  remoteOption: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  closingDate: dateSchema.nullable(),
  publishedAt: dateSchema.nullable().optional(),
  createdBy: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.email(),
  }),
  memberCount: z.number().optional(),
  candidateCount: z.number().optional(),
});

export type JobListingDetailResponse = z.infer<
  typeof jobListingDetailResponseSchema
>;
