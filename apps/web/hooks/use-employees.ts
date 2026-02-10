'use client';

import useSWR from 'swr';
import type { EmployeeListItem } from '@repo/contracts';
import type { EmployeeListQuery } from '@repo/contracts';
import { buildQuery } from '@/lib/utils';

type UseEmployeesOptions = Partial<EmployeeListQuery>;

type UseEmployeesReturn = {
  employees: EmployeeListItem[] | undefined;
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
  } = options;

  // Build query string
  const queryString = buildQuery({
    search,
    statuses,
    branchIds,
    jobTitles,
    page,
    limit,
  });

  const endpoint = `/employees${queryString ? `?${queryString}` : ''}`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: swrMutate,
  } = useSWR<{ employees: EmployeeListItem[]; total: number }>(endpoint);

  return {
    employees: data?.employees,
    total: data?.total,
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,
  };
}
