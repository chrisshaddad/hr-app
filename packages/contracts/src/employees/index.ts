import { z } from 'zod';
import { dateSchema } from '../common';

export const employeeStatusSchema = z.enum([
  'ACTIVE',
  'ON_BOARDING',
  'OFF_BOARDING',
  'ON_LEAVE',
  'PROBATION',
]);

export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;

// Employee personal info
export const employeePersonalInfoSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
});

export type EmployeePersonalInfo = z.infer<typeof employeePersonalInfoSchema>;

// Employee address
export const employeeAddressSchema = z.object({
  id: z.uuid(),
  primaryAddress: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  postCode: z.string().nullable(),
});

export type EmployeeAddress = z.infer<typeof employeeAddressSchema>;

// Minimal line manager info
export const lineManagerSchema = z.object({
  id: z.uuid(),
  jobTitle: z.string(),
  personalInfo: employeePersonalInfoSchema.nullable(),
});

export type LineManager = z.infer<typeof lineManagerSchema>;

// Full employee response
export const employeeResponseSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  branchId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  lineManagerId: z.uuid().nullable(),
  userId: z.uuid().nullable(),
  jobTitle: z.string(),
  joinDate: dateSchema,
  timezone: z.string(),
  status: employeeStatusSchema,
  personalInfo: employeePersonalInfoSchema.nullable(),
  address: employeeAddressSchema.nullable(),
  lineManager: lineManagerSchema.nullable(),
});

export type EmployeeDetailResponse = z.infer<typeof employeeResponseSchema>;

// Minimal department info for list view
export const departmentInfoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type DepartmentInfo = z.infer<typeof departmentInfoSchema>;

// Minimal branch/office info for list view
export const branchInfoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type BranchInfo = z.infer<typeof branchInfoSchema>;

// Minimal line manager info for list view
export const lineManagerListItemSchema = z.object({
  id: z.uuid(),
  personalInfo: employeePersonalInfoSchema
    .pick({
      firstName: true,
      lastName: true,
      email: true,
    })
    .nullable(),
});

export type LineManagerListItem = z.infer<typeof lineManagerListItemSchema>;

// List response (minimal fields for tables)
export const employeeListItemSchema = z.object({
  id: z.uuid(),
  jobTitle: z.string(),
  status: employeeStatusSchema,
  userId: z.uuid().nullable(),
  personalInfo: employeePersonalInfoSchema.nullable(),
  lineManager: lineManagerListItemSchema.nullable(),
  department: departmentInfoSchema.nullable(),
  branch: branchInfoSchema.nullable(),
});

export type EmployeeListItem = z.infer<typeof employeeListItemSchema>;
