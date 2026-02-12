import { z } from 'zod';

export const templateTypeSchema = z.enum(['ONBOARDING', 'OFFBOARDING']);
export type TemplateType = z.infer<typeof templateTypeSchema>;
