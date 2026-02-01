import { z } from 'zod';

export const verifyMagicLinkSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyMagicLinkDto = z.infer<typeof verifyMagicLinkSchema>;
