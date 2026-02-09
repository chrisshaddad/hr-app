import { z } from 'zod';

export const branchUpdateRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  street1: z.string().nullable().optional(),
  street2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().min(1).optional(),
  phoneNumber: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
});

export type BranchUpdateRequest = z.infer<typeof branchUpdateRequestSchema>;
