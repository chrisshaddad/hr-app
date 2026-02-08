'use client';

import useSWR from 'swr';
import type { EmployeeListItem, EmployeeStatus } from '@repo/contracts';

type UseEmployeesOptions = {
  search?: string;
  statuses?: EmployeeStatus[];
  branchIds?: string[];
  jobTitles?: string[];
  page?: number;
  limit?: number;
  enabled?: boolean;
};

type UseEmployeesReturn = {
  employees: Array<EmployeeListItem> | undefined;
  total: number | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  mutate: () => void;
};

/**
 * Hook for fetching employees with optional filters and search
 */
export function useEmployees(options: UseEmployeesOptions): UseEmployeesReturn {
  const {
    search,
    statuses,
    branchIds,
    jobTitles,
    page = 1,
    limit = 20,
    enabled = true,
  } = options;

  // Build query string
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (statuses?.length) {
    statuses.forEach((status) => params.append('statuses', status));
  }
  if (branchIds?.length) {
    branchIds.forEach((id) => params.append('branchIds', id));
  }
  if (jobTitles?.length) {
    jobTitles.forEach((title) => params.append('jobTitles', title));
  }
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const queryString = params.toString();
  const endpoint = `/employees${queryString ? `?${queryString}` : ''}`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: swrMutate,
  } = useSWR<{ employees: Array<EmployeeListItem>; total: number }>(
    enabled ? endpoint : null,
  );

  return {
    employees: data?.employees,
    total: data?.total,
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,
  };
}
