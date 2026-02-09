import { z } from 'zod';
import { employmentTypeSchema } from './enums.schema';

export const jobListingCreateRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  departmentId: z.string().uuid(),
  officeId: z.string().uuid().optional(),
  employmentType: employmentTypeSchema,
  openingsQuantity: z.number().int().positive().default(1),
  closingDate: z.string().datetime().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  salaryCurrency: z.string().default('USD'),
  experienceYears: z.number().int().nonnegative().optional(),
  educationLevel: z.string().optional(),
  skills: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  remoteOption: z.boolean().default(false),
});

export type JobListingCreateRequest = z.infer<
  typeof jobListingCreateRequestSchema
>;
