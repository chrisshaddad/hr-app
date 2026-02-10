import { z } from 'zod';
import { organizationStatusSchema } from './organization-status.schema';
import { dateSchema } from '../common';

// Minimal user info for creator/approver
const organizationUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});

// Response from GET /organizations/:id
export const organizationDetailResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: organizationStatusSchema,
  description: z.string().nullable(),
  website: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  approvedAt: dateSchema.nullable(),
  createdBy: organizationUserSchema,
  approvedBy: organizationUserSchema.nullable(),
  _count: z.object({
    employees: z.number(),
    branches: z.number(),
  }),
});
export type OrganizationDetailResponse = z.infer<
  typeof organizationDetailResponseSchema
>;
