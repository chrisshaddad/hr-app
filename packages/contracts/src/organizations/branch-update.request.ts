import { z } from 'zod';
import { organizationStatusSchema } from './organization-status.schema';

export const branchUpdateRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  organizationId: z.string().uuid().optional(),
  orgStatus: organizationStatusSchema.optional(),
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  phoneNumber: z.string().optional(),
  email: z.email().optional(),
});

export type BranchUpdateRequest = z.infer<typeof branchUpdateRequestSchema>;
