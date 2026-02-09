import { z } from 'zod';
import { dateSchema } from '../common';

export const workflowStageCreateRequestSchema = z.object({
  title: z.string().min(1).max(255),
  rank: z.number().int().nonnegative(),
});

export type WorkflowStageCreateRequest = z.infer<
  typeof workflowStageCreateRequestSchema
>;

export const workflowStageDetailResponseSchema = z.object({
  id: z.string().uuid(),
  jobListingId: z.string().uuid(),
  title: z.string(),
  rank: z.number(),
  isLocked: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  candidateCount: z.number().optional(),
});

export type WorkflowStageDetailResponse = z.infer<
  typeof workflowStageDetailResponseSchema
>;

export const workflowStageListResponseSchema = z.object({
  data: z.array(workflowStageDetailResponseSchema),
  total: z.number(),
});

export type WorkflowStageListResponse = z.infer<
  typeof workflowStageListResponseSchema
>;

export const workflowStageUpdateRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  rank: z.number().int().nonnegative().optional(),
});

export type WorkflowStageUpdateRequest = z.infer<
  typeof workflowStageUpdateRequestSchema
>;
