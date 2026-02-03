import { z } from 'zod';
import { organizationStatusSchema } from './organization-status.schema';
import { dateSchema } from '../common';

// Minimal user info for organization creator
const organizationCreatorSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});

// Organization list item
const organizationListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: organizationStatusSchema,
  website: z.string().nullable(),
  createdAt: dateSchema,
  createdBy: organizationCreatorSchema,
  _count: z.object({
    users: z.number(),
    branches: z.number(),
  }),
});
export type OrganizationListItem = z.infer<typeof organizationListItemSchema>;

// Response from GET /organizations
export const organizationListResponseSchema = z.object({
  organizations: z.array(organizationListItemSchema),
  total: z.number(),
});
export type OrganizationListResponse = z.infer<
  typeof organizationListResponseSchema
>;
