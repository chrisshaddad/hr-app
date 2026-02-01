import { z } from 'zod';

// Organization creator (minimal user info)
export const organizationCreatorSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});
export type OrganizationCreator = z.infer<typeof organizationCreatorSchema>;

// Organization approver (minimal user info, nullable)
export const organizationApproverSchema = organizationCreatorSchema.nullable();
export type OrganizationApprover = z.infer<typeof organizationApproverSchema>;
