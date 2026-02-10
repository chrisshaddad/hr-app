import { z } from 'zod';
import { dateSchema, genderSchema } from '../common';

export const employeePersonalInfoSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string().nullable(),

  // Profile fields
  dateOfBirth: dateSchema.nullable(),
  gender: genderSchema.nullable(),
  bio: z.string().nullable(),

  // Address fields
  street1: z.string().nullable(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),

  // Emergency contact
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  emergencyContactRelation: z.string().nullable(),

  nationality: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
});

export type EmployeePersonalInfo = z.infer<typeof employeePersonalInfoSchema>;
