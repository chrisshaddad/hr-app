import { z } from 'zod';

export const employeeStatusSchema = z.enum([
  'ACTIVE',
  'ON_BOARDING',
  'OFF_BOARDING',
  'ON_LEAVE',
  'PROBATION',
]);
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;
