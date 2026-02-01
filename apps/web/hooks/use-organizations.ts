'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { apiPatch } from '@/lib/api';
import type {
  OrganizationListResponse,
  OrganizationDetail,
  OrganizationActionResponse,
  OrganizationStatus,
} from '@repo/contracts';

interface UseOrganizationsOptions {
  status?: OrganizationStatus;
  enabled?: boolean;
}

interface UseOrganizationsReturn {
  organizations: OrganizationListResponse['organizations'] | undefined;
  total: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Hook for fetching the list of organizations with optional status filter
 */
export function useOrganizations(
  options: UseOrganizationsOptions = {},
): UseOrganizationsReturn {
  const { status, enabled = true } = options;

  const endpoint = status
    ? `/organizations?status=${status}`
    : '/organizations';

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<OrganizationListResponse>(enabled ? endpoint : null);

  return {
    organizations: data?.organizations,
    total: data?.total,
    isLoading,
    error,
    mutate: swrMutate,
  };
}

interface UseOrganizationOptions {
  enabled?: boolean;
}

interface UseOrganizationReturn {
  organization: OrganizationDetail | undefined;
  isLoading: boolean;
  error: Error | undefined;
  approve: () => Promise<OrganizationActionResponse>;
  reject: () => Promise<OrganizationActionResponse>;
  mutate: () => void;
}

/**
 * Hook for fetching a single organization and performing actions (approve/reject)
 */
export function useOrganization(
  id: string,
  options: UseOrganizationOptions = {},
): UseOrganizationReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<OrganizationDetail>(enabled ? `/organizations/${id}` : null);

  const invalidateAll = useCallback(() => {
    // Invalidate this specific organization
    swrMutate();
    // Invalidate the organizations list cache
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/organizations'),
      undefined,
      { revalidate: true },
    );
  }, [swrMutate]);

  const approve = useCallback(async () => {
    const result = await apiPatch<OrganizationActionResponse>(
      `/organizations/${id}/approve`,
    );
    invalidateAll();
    return result;
  }, [id, invalidateAll]);

  const reject = useCallback(async () => {
    const result = await apiPatch<OrganizationActionResponse>(
      `/organizations/${id}/reject`,
    );
    invalidateAll();
    return result;
  }, [id, invalidateAll]);

  return {
    organization: data,
    isLoading,
    error,
    approve,
    reject,
    mutate: swrMutate,
  };
}
