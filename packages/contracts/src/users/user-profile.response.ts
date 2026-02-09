import { z } from 'zod';
import { dateSchema } from '../common';

export const genderSchema = z.enum([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);

export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  dateOfBirth: dateSchema.nullable(),
  gender: genderSchema.nullable(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  street1: z.string().nullable(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  emergencyContactRelation: z.string().nullable(),
  nationality: z.string().nullable(),
  profilePictureUrl: z.string().url().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
