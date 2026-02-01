import { z } from 'zod';
import { organizationDetailSchema } from './organization-detail.schema';

// Response for approve/reject actions
export const organizationActionResponseSchema = z.object({
  message: z.string(),
  organization: organizationDetailSchema,
});
export type OrganizationActionResponse = z.infer<
  typeof organizationActionResponseSchema
>;
