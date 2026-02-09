import { z } from 'zod';
import { dateSchema } from '../common';

export const workflowStageCandidateResponseSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  jobListingId: z.string().uuid(),
  workflowStageId: z.string().uuid(),
  isActive: z.boolean(),
  addedAt: dateSchema,
  movedAt: dateSchema.nullable(),
  notes: z.string().nullable(),
  candidate: z
    .object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.email(),
    })
    .optional(),
});

export type WorkflowStageCandidateResponse = z.infer<
  typeof workflowStageCandidateResponseSchema
>;

export const moveCandidateRequestSchema = z.object({
  newStageId: z.string().uuid(),
  notes: z.string().optional(),
});

export type MoveCandidateRequest = z.infer<typeof moveCandidateRequestSchema>;

export const candidateNotesRequestSchema = z.object({
  notes: z.string().nullable(),
});

export type CandidateNotesRequest = z.infer<typeof candidateNotesRequestSchema>;
