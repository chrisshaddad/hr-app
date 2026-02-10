import { z } from 'zod';

export const employeeAddressSchema = z.object({
  id: z.uuid(),
  primaryAddress: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  postCode: z.string().nullable(),
});

export type EmployeeAddress = z.infer<typeof employeeAddressSchema>;
