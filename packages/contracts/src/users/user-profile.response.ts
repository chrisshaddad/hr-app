import { z } from 'zod';
import { dateSchema } from '../common';
import { UserRole, userRoleSchema } from './user-role.schema';

/**
 * Allowed gender values for a user profile.
 */
export const genderSchema = z.enum([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);

/**
 * Lightweight reference schema for organizational entities
 * such as departments, branches, and roles.
 */
const orgReferenceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

/**
 * User Profile Response Schema
 *
 * Represents the full user profile returned by the API,
 * including identity, profile details, and organizational context.
 *
 * This contract is shared between backend and frontend
 * and must remain stable.
 */
export const userProfileResponseSchema = z.object({
  /** Unique identifier of the user profile */
  id: z.uuid(),

  /** Unique identifier of the user */
  userId: z.uuid(),

  /** User email address */
  email: z.email(),

  /** Department the user belongs to */
  department: orgReferenceSchema.nullable(),

  /** Branch the user is assigned to */
  branch: orgReferenceSchema.nullable(),

  /** Role assigned to the user */
  role: userRoleSchema,

  /** User date of birth */
  dateOfBirth: dateSchema.nullable(),

  /** User gender */
  gender: genderSchema.nullable(),

  /** Short biography or description */
  bio: z.string().nullable(),

  /** Contact phone number */
  phoneNumber: z.string().nullable(),

  /** Primary street address */
  street1: z.string().nullable(),

  /** Secondary street address */
  street2: z.string().nullable(),

  /** City */
  city: z.string().nullable(),

  /** State or region */
  state: z.string().nullable(),

  /** Postal or ZIP code */
  postalCode: z.string().nullable(),

  /** Country */
  country: z.string().nullable(),

  /** Emergency contact full name */
  emergencyContactName: z.string().nullable(),

  /** Emergency contact phone number */
  emergencyContactPhone: z.string().nullable(),

  /** Relationship to the emergency contact */
  emergencyContactRelation: z.string().nullable(),

  /** User nationality */
  nationality: z.string().nullable(),

  /** URL of the user's profile picture */
  profilePictureUrl: z.string().url().nullable(),

  /** Profile creation timestamp */
  createdAt: dateSchema,

  /** Profile last update timestamp */
  updatedAt: dateSchema,
});

/**
 * TypeScript type inferred from {@link userProfileResponseSchema}.
 *
 * Represents the validated user profile response object.
 */
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
