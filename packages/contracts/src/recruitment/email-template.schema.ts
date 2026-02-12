import { z } from 'zod';
import { dateSchema } from '../common';

export const emailTemplateSchema = z.object({
  emailTemplateTypeId: z.string().uuid(),
  subject: z.string().min(1),
  body: z.string().min(1),
  isActive: z.boolean().optional(),
});

export type EmailTemplateSchema = z.infer<typeof emailTemplateSchema>;

export const emailTemplateSettingCreateRequestSchema = z.object({
  emailTemplateTypeId: z.string().uuid(),
  subject: z.string().min(1),
  body: z.string().min(1),
  isActive: z.boolean().default(true),
});

export type EmailTemplateSettingCreateRequest = z.infer<
  typeof emailTemplateSettingCreateRequestSchema
>;

export const emailTemplateTypeResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: dateSchema,
});

export type EmailTemplateTypeResponse = z.infer<
  typeof emailTemplateTypeResponseSchema
>;

export const emailTemplateSettingResponseSchema = z.object({
  id: z.string().uuid(),
  workflowStageId: z.string().uuid(),
  emailTemplateTypeId: z.string().uuid(),
  subject: z.string(),
  body: z.string(),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  emailTemplateType: emailTemplateTypeResponseSchema.optional(),
});

export type EmailTemplateSettingResponse = z.infer<
  typeof emailTemplateSettingResponseSchema
>;
