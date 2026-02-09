import { z } from 'zod';
import { candidateSourceSchema } from './enums.schema';

export const candidateUpdateRequestSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  phoneNumber: z.string().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  portfolioUrl: z.string().url().nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  source: candidateSourceSchema.optional(),
  sourceDetails: z.string().nullable().optional(),
});

export type CandidateUpdateRequest = z.infer<
  typeof candidateUpdateRequestSchema
>;
