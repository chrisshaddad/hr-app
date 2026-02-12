import { z } from 'zod';
import { userRoleSchema } from '../users';
import { organizationStatusSchema } from './organization-status.schema';

// Response from GET /organizations/:id/members
const organizationMemberSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: userRoleSchema,
  status: organizationStatusSchema,
});

export const organizationMembersResponseSchema = z.object({
  members: z.array(organizationMemberSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type OrganizationMembersResponse = z.infer<
  typeof organizationMembersResponseSchema
>;
