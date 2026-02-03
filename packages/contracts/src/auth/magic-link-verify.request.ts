import { z } from 'zod';

// Request for POST /auth/magic-link/verify
export const magicLinkVerifyRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
export type MagicLinkVerifyRequest = z.infer<
  typeof magicLinkVerifyRequestSchema
>;
