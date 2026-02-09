import { z } from 'zod';
import { dateSchema } from '../common';

export const boardActivityResponseSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  fromStageId: z.string().uuid().nullable(),
  toStageId: z.string().uuid(),
  memberId: z.string().uuid(),
  notes: z.string().nullable(),
  activityType: z.string(),
  occurredAt: dateSchema,
  member: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.email(),
    })
    .optional(),
  fromStage: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
    })
    .nullable()
    .optional(),
  toStage: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
    })
    .optional(),
});

export type BoardActivityResponse = z.infer<typeof boardActivityResponseSchema>;
