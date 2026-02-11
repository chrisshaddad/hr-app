import { z } from 'zod';

// Request body for POST /organizations
export const organizationUpdateRequestSchema = z.object({
  name: z.string().min(3, 'Name is required').optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type OrganizationUpdateRequest = z.infer<
  typeof organizationUpdateRequestSchema
>;
