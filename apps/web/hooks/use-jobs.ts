'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { apiPost, apiPatch, apiDelete } from '@/lib/api';
import type {
  JobListResponse,
  JobDetailResponse,
  JobStatus,
  CreateJobRequest,
  UpdateJobRequest,
} from '@repo/contracts';

interface UseJobsOptions {
  status?: JobStatus;
  search?: string;
  enabled?: boolean;
}

interface UseJobsReturn {
  jobs: JobListResponse['jobs'] | undefined;
  total: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const { status, search, enabled = true } = options;

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  const query = params.toString();
  const endpoint = query ? `/jobs?${query}` : '/jobs';

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<JobListResponse>(enabled ? endpoint : null);

  return {
    jobs: data?.jobs,
    total: data?.total,
    isLoading,
    error,
    mutate: swrMutate,
  };
}

interface UseJobOptions {
  enabled?: boolean;
}

interface UseJobReturn {
  job: JobDetailResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  updateJob: (data: UpdateJobRequest) => Promise<JobDetailResponse>;
}

export function useJob(id: string, options: UseJobOptions = {}): UseJobReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<JobDetailResponse>(enabled ? `/jobs/${id}` : null);

  const invalidateAll = useCallback(() => {
    swrMutate();
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/jobs'),
      undefined,
      { revalidate: true },
    );
  }, [swrMutate]);

  const updateJob = useCallback(
    async (updateData: UpdateJobRequest) => {
      const result = await apiPatch<JobDetailResponse>(
        `/jobs/${id}`,
        updateData,
      );
      invalidateAll();
      return result;
    },
    [id, invalidateAll],
  );

  return {
    job: data,
    isLoading,
    error,
    mutate: swrMutate,
    updateJob,
  };
}

export async function createJob(
  data: CreateJobRequest,
): Promise<JobDetailResponse> {
  const result = await apiPost<JobDetailResponse>('/jobs', data);
  mutate(
    (key) => typeof key === 'string' && key.startsWith('/jobs'),
    undefined,
    { revalidate: true },
  );
  return result;
}

export async function deleteJob(id: string): Promise<void> {
  await apiDelete(`/jobs/${id}`);
  mutate(
    (key) => typeof key === 'string' && key.startsWith('/jobs'),
    undefined,
    { revalidate: true },
  );
}
