import { z } from 'zod';
import { dateSchema } from '../common';
import { userRoleSchema } from './user-role.schema';
import { userProfileResponseSchema } from './user-profile.response';

export const userListItemResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  name: z.string(),
  role: userRoleSchema,
  departmentId: z.string().uuid().nullable(),
  createdAt: dateSchema,
});

export const userListResponseSchema = z.object({
  data: z.array(userListItemResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type UserListItemResponse = z.infer<typeof userListItemResponseSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
