import { z } from 'zod';
import { organizationStatusSchema } from './organization-status.schema';

export const branchCreateRequestSchema = z.object({
  name: z.string().min(1).max(255),
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  phoneNumber: z.string().optional(),
  email: z.email().optional(),
});

export type BranchCreateRequest = z.infer<typeof branchCreateRequestSchema>;
