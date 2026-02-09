import { z } from 'zod';
import { dateSchema } from '../common';

export const userProfileUpdateRequestSchema = z.object({
  dateOfBirth: dateSchema.nullable().optional(),
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .nullable()
    .optional(),
  bio: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  street1: z.string().nullable().optional(),
  street2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  emergencyContactRelation: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  profilePictureUrl: z.string().url().nullable().optional(),
});

export type UserProfileUpdateRequest = z.infer<
  typeof userProfileUpdateRequestSchema
>;
