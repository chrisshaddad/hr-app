import { z } from 'zod';

// Request body for POST /organizations
export const organizationCreateRequestSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.string().email(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type OrganizationCreateRequest = z.infer<
  typeof organizationCreateRequestSchema
>;
