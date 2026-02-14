import { z } from 'zod';

export const updateApplicationStatusRequestSchema = z.object({
  status: z.enum([
    'APPLIED',
    'SCREENING',
    'FIRST_INTERVIEW',
    'SECOND_INTERVIEW',
    'OFFERED',
    'HIRED',
    'REJECTED',
  ]),
});

export type UpdateApplicationStatusRequest = z.infer<
  typeof updateApplicationStatusRequestSchema
>;
