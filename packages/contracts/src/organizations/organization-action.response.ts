import { z } from 'zod';
import { organizationDetailResponseSchema } from './organization-detail.response';

// Response from PATCH /organizations/:id/approve or /reject
export const organizationActionResponseSchema = z.object({
  message: z.string(),
  organization: organizationDetailResponseSchema,
});
export type OrganizationActionResponse = z.infer<
  typeof organizationActionResponseSchema
>;
