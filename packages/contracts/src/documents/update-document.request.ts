import { z } from 'zod';
import { documentTypeSchema } from './document-type.schema';

export const updateDocumentRequestSchema = z.object({
  documentType: documentTypeSchema.optional(),
  fileName: z.string().min(1, 'File name is required').optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
});

export type UpdateDocumentRequest = z.infer<typeof updateDocumentRequestSchema>;
