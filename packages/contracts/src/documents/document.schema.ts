import { z } from 'zod';
import { dateSchema } from '../common';
import { documentTypeSchema } from './document-type.schema';

export const documentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  documentType: documentTypeSchema,
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number().nullable(),
  mimeType: z.string().nullable(),
  uploadedAt: dateSchema,
  updatedAt: dateSchema,
  deletedAt: dateSchema.nullable(),
});

export type Document = z.infer<typeof documentSchema>;

export const documentResponseSchema = documentSchema;

export type DocumentResponse = z.infer<typeof documentResponseSchema>;

export const documentListResponseSchema = z.object({
  documents: z.array(documentResponseSchema),
  total: z.number(),
});

export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
