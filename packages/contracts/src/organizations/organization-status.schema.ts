import { z } from 'zod';

// Organization status enum
export const organizationStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'SUSPENDED',
  'INACTIVE',
]);
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>;
