import { z } from 'zod';
import { dateSchema } from '../common';

export const candidateEvaluationRequestSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  feedback: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendation: z.string().optional(),
});

export type CandidateEvaluationRequest = z.infer<
  typeof candidateEvaluationRequestSchema
>;

export const candidateEvaluationResponseSchema = z.object({
  id: z.string().uuid(),
  workflowStageCandidateId: z.string().uuid(),
  memberId: z.string().uuid(),
  rating: z.number().nullable(),
  feedback: z.string().nullable(),
  strengths: z.string().nullable(),
  weaknesses: z.string().nullable(),
  recommendation: z.string().nullable(),
  evaluatedAt: dateSchema,
  updatedAt: dateSchema,
  evaluator: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.email(),
    })
    .optional(),
});

export type CandidateEvaluationResponse = z.infer<
  typeof candidateEvaluationResponseSchema
>;
