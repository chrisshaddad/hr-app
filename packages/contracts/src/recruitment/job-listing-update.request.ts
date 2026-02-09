import { z } from 'zod';
import { employmentTypeSchema, jobListingStatusSchema } from './enums.schema';
import { dateSchema } from '../common';

export const jobListingUpdateRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  departmentId: z.string().uuid().optional(),
  status: jobListingStatusSchema,
  officeId: z.string().uuid().nullable().optional(),
  employmentType: employmentTypeSchema.optional(),
  openingsQuantity: z.number().int().positive().optional(),
  closingDate: z.string().datetime().nullable().optional(),
  salaryMin: z.number().positive().nullable().optional(),
  salaryMax: z.number().positive().nullable().optional(),
  salaryCurrency: z.string().optional(),
  experienceYears: z.number().int().nonnegative().nullable().optional(),
  educationLevel: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  remoteOption: z.boolean().optional(),
  publishedAt: dateSchema.nullable().optional(),
});

export type JobListingUpdateRequest = z.infer<
  typeof jobListingUpdateRequestSchema
>;
