import { z } from 'zod';

export const jobListingStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'CLOSED',
  'ARCHIVED',
]);
export const employmentTypeSchema = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'TEMPORARY',
  'INTERNSHIP',
]);
export const candidateSourceSchema = z.enum([
  'DIRECT_APPLICATION',
  'REFERRAL',
  'LINKEDIN',
  'JOB_BOARD',
  'RECRUITMENT_AGENCY',
  'CAREER_FAIR',
  'OTHER',
]);

export type JobListingStatus = z.infer<typeof jobListingStatusSchema>;
export type EmploymentType = z.infer<typeof employmentTypeSchema>;
export type CandidateSource = z.infer<typeof candidateSourceSchema>;
