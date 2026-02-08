import { z } from 'zod';

export const jobStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'ON_HOLD',
  'CLOSED',
  'INACTIVE',
]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const jobDepartmentSchema = z.enum([
  'DEVELOPMENT',
  'DESIGN',
  'MARKETING',
  'MANAGEMENT',
  'HR',
  'SALES',
  'OTHER',
]);
export type JobDepartment = z.infer<typeof jobDepartmentSchema>;

export const employmentTypeSchema = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
]);
export type EmploymentType = z.infer<typeof employmentTypeSchema>;

export const applicationStageSchema = z.enum([
  'APPLIED',
  'SCREENING',
  'INTERVIEW_1',
  'INTERVIEW_2',
  'OFFERED',
  'HIRED',
  'REJECTED',
]);
export type ApplicationStage = z.infer<typeof applicationStageSchema>;
