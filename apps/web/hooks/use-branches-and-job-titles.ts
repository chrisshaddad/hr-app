'use client';

import useSWR from 'swr';

export function useBranchesAndJobTitles(): {
  branches: Array<{ id: string; name: string }> | undefined;
  jobTitles: string[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
} {
  const { data, error, isLoading } = useSWR<{
    branches: Array<{ id: string; name: string }>;
    jobTitles: string[];
  }>(`/organizations/branches-and-job-titles`);

  return {
    branches: data?.branches,
    jobTitles: data?.jobTitles,
    isLoading,
    error,
  };
}
