import { z } from 'zod';

export const employeePersonalInfoSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
});

export type EmployeePersonalInfo = z.infer<typeof employeePersonalInfoSchema>;
