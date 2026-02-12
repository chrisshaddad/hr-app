'use client';

import useSWR from 'swr';
import type { UsersListResponse } from '@repo/contracts';

interface UseUsersOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
}

interface UseUsersReturn {
  users: UsersListResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { enabled = true, page = 1, limit = 20 } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<UsersListResponse>(
    enabled ? `/users/organization?page=${page}&limit=${limit}` : null,
  );

  return { users: data, isLoading, error, mutate: swrMutate };
}
