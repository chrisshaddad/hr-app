import { z } from 'zod';
import { userProfileResponseSchema } from './user-profile.response';

/**
 * Paginated user list response schema
 *
 * Represents a paginated list of users with pagination metadata.
 */
export const userListResponseSchema = z.object({
  /** Array of full user profiles */
  data: z.array(userProfileResponseSchema),

  /** Pagination metadata */
  pagination: z.object({
    /** Current page number */
    page: z.number(),

    /** Number of users per page */
    limit: z.number(),

    /** Total number of users */
    total: z.number(),

    /** Total number of pages available */
    totalPages: z.number(),
  }),
});

export type UserListResponse = z.infer<typeof userListResponseSchema>;
