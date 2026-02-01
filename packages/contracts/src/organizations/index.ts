import { z } from 'zod';

// Organization status enum
export const organizationStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'SUSPENDED',
  'INACTIVE',
]);
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>;

// Organization creator (minimal user info)
export const organizationCreatorSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});
export type OrganizationCreator = z.infer<typeof organizationCreatorSchema>;

// Organization approver (minimal user info, nullable)
export const organizationApproverSchema = organizationCreatorSchema.nullable();
export type OrganizationApprover = z.infer<typeof organizationApproverSchema>;

// Organization list item (for listing)
export const organizationListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: organizationStatusSchema,
  website: z.string().nullable(),
  createdAt: z.string().datetime(),
  createdBy: organizationCreatorSchema,
  _count: z.object({
    users: z.number(),
    branches: z.number(),
  }),
});
export type OrganizationListItem = z.infer<typeof organizationListItemSchema>;

// Organization list response
export const organizationListResponseSchema = z.object({
  organizations: z.array(organizationListItemSchema),
  total: z.number(),
});
export type OrganizationListResponse = z.infer<
  typeof organizationListResponseSchema
>;

// Full organization detail (for single org view)
export const organizationDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: organizationStatusSchema,
  description: z.string().nullable(),
  website: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  approvedAt: z.string().datetime().nullable(),
  createdBy: organizationCreatorSchema,
  approvedBy: organizationApproverSchema,
  _count: z.object({
    users: z.number(),
    branches: z.number(),
  }),
});
export type OrganizationDetail = z.infer<typeof organizationDetailSchema>;

// Query params for listing organizations
export const listOrganizationsQuerySchema = z.object({
  status: organizationStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListOrganizationsQuery = z.infer<
  typeof listOrganizationsQuerySchema
>;

// Response for approve/reject actions
export const organizationActionResponseSchema = z.object({
  message: z.string(),
  organization: organizationDetailSchema,
});
export type OrganizationActionResponse = z.infer<
  typeof organizationActionResponseSchema
>;
