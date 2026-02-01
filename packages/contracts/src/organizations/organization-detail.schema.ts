import { z } from 'zod';
import { organizationStatusSchema } from './organization-status.schema';
import {
  organizationCreatorSchema,
  organizationApproverSchema,
} from './organization-creator.schema';

// Full organization detail (for single org view)
export const organizationDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: organizationStatusSchema,
  description: z.string().nullable(),
  website: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  approvedAt: z.iso.datetime().nullable(),
  createdBy: organizationCreatorSchema,
  approvedBy: organizationApproverSchema,
  _count: z.object({
    users: z.number(),
    branches: z.number(),
  }),
});
export type OrganizationDetail = z.infer<typeof organizationDetailSchema>;
