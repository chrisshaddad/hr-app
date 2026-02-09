import { z } from 'zod';
import { dateSchema } from '../common';
import { candidateSourceSchema } from './enums.schema';

export const candidateDetailResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phoneNumber: z.string().nullable(),
  photoUrl: z.string().nullable(),
  cvUrl: z.string(),
  attachmentUrl: z.string().nullable(),
  source: candidateSourceSchema,
  sourceDetails: z.string().nullable(),
  coverLetter: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  tags: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        color: z.string().nullable(),
      }),
    )
    .optional(),
});

export type CandidateDetailResponse = z.infer<
  typeof candidateDetailResponseSchema
>;
