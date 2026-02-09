import { z } from 'zod';
import { dateSchema } from '../common';

export const branchDetailResponseSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  street1: z.string().nullable(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string(),
  phoneNumber: z.string().nullable(),
  email: z.email().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  departmentCount: z.number().optional(),
});

export type BranchDetailResponse = z.infer<typeof branchDetailResponseSchema>;
