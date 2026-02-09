import { z } from 'zod';
import { candidateSourceSchema } from './enums.schema';

export const candidateCreateRequestSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.email(),
  phoneNumber: z.string().optional(),
  cvUrl: z.string().url(),
  attachmentUrl: z.string().url().optional(),
  source: candidateSourceSchema.default('DIRECT_APPLICATION'),
  sourceDetails: z.string().optional(),
  coverLetter: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  photoUrl: z.string().url().optional(),
});

export type CandidateCreateRequest = z.infer<
  typeof candidateCreateRequestSchema
>;
