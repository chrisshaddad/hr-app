import { z } from 'zod';
import { organizationStatusSchema } from './organization-status.schema';
import { organizationCreatorSchema } from './organization-creator.schema';

// Organization list item (for listing)
export const organizationListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: organizationStatusSchema,
  website: z.string().nullable(),
  createdAt: z.iso.datetime(),
  createdBy: organizationCreatorSchema,
  _count: z.object({
    users: z.number(),
    branches: z.number(),
  }),
});
export type OrganizationListItem = z.infer<typeof organizationListItemSchema>;

// Organization list response
export const organizationListResponseSchema = z.object({
  organizations: z.array(organizationListItemSchema),
  total: z.number(),
});
export type OrganizationListResponse = z.infer<
  typeof organizationListResponseSchema
>;
