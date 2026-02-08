'use client';

import useSWR from 'swr';
import type { BranchListResponse } from '@repo/contracts';

interface UseBranchesOptions {
  enabled?: boolean;
}

interface UseBranchesReturn {
  branches: BranchListResponse['branches'] | undefined;
  total: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export function useBranches(
  options: UseBranchesOptions = {},
): UseBranchesReturn {
  const { enabled = true } = options;

  const { data, error, isLoading } = useSWR<BranchListResponse>(
    enabled ? '/branches' : null,
  );

  return {
    branches: data?.branches,
    total: data?.total,
    isLoading,
    error,
  };
}
