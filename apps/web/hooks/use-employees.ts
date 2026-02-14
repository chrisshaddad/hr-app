'use client';

import useSWR from 'swr';
import type { EmployeeListResponse } from '@repo/contracts';

interface UseEmployeesReturn {
  employees: EmployeeListResponse['employees'] | undefined;
  total: number | undefined;
  page: number | undefined;
  limit: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/*
 * Hook for fetching the list of employees
 */
export function useEmployees(page: number, limit: number): UseEmployeesReturn {
  const endpoint = `/employees?page=${page}&limit=${limit}`;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<EmployeeListResponse>(endpoint);

  return {
    employees: data?.employees,
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
    isLoading,
    error,
    mutate: swrMutate,
  };
}
