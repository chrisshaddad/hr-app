import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

// Gender enum schema
const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);

// Marital status enum schema
const maritalStatusSchema = z.enum([
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY',
]);

// Employee status enum schema
const employeeStatusSchema = z.enum([
  'ACTIVE',
  'ON_BOARDING',
  'PROBATION',
  'ON_LEAVE',
  'TERMINATED',
]);

// User profile (EmployeeProfile from schema)
const userProfileSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  dateOfBirth: z.string().nullable(),
  gender: genderSchema.nullable(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),

  // Address fields
  street1: z.string().nullable(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),

  // Insurance
  insuranceProvider: z.string().nullable(),

  // Tax Info
  personalTaxId: z.string().nullable(),

  // Marital Status
  maritalStatus: maritalStatusSchema.nullable(),

  // Social Insurance
  socialInsuranceNumber: z.string().nullable(),

  // Emergency contact
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  emergencyContactRelation: z.string().nullable(),

  nationality: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  timezone: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Response from /auth/me endpoint
export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: userRoleSchema,
  employeeStatus: employeeStatusSchema.nullable(),
  organizationId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  isConfirmed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: userProfileSchema.nullable().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type MaritalStatus = z.infer<typeof maritalStatusSchema>;
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;
