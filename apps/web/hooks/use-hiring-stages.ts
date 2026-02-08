'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { apiPost, apiPatch, apiDelete } from '@/lib/api';
import type {
  HiringStageListResponse,
  HiringStageItem,
  CreateHiringStageRequest,
  ReorderHiringStagesRequest,
} from '@repo/contracts';

interface UseHiringStagesOptions {
  enabled?: boolean;
}

interface UseHiringStagesReturn {
  stages: HiringStageListResponse['stages'] | undefined;
  total: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  createStage: (data: CreateHiringStageRequest) => Promise<HiringStageItem>;
  reorderStages: (
    data: ReorderHiringStagesRequest,
  ) => Promise<HiringStageListResponse>;
  deleteStage: (id: string) => Promise<void>;
}

export function useHiringStages(
  options: UseHiringStagesOptions = {},
): UseHiringStagesReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<HiringStageListResponse>(enabled ? '/hiring-stages' : null);

  const invalidateAll = useCallback(() => {
    swrMutate();
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/hiring-stages'),
      undefined,
      { revalidate: true },
    );
  }, [swrMutate]);

  const createStage = useCallback(
    async (createData: CreateHiringStageRequest) => {
      const result = await apiPost<HiringStageItem>(
        '/hiring-stages',
        createData,
      );
      invalidateAll();
      return result;
    },
    [invalidateAll],
  );

  const reorderStages = useCallback(
    async (reorderData: ReorderHiringStagesRequest) => {
      const result = await apiPatch<HiringStageListResponse>(
        '/hiring-stages/reorder',
        reorderData,
      );
      invalidateAll();
      return result;
    },
    [invalidateAll],
  );

  const deleteStage = useCallback(
    async (id: string) => {
      await apiDelete(`/hiring-stages/${id}`);
      invalidateAll();
    },
    [invalidateAll],
  );

  return {
    stages: data?.stages,
    total: data?.total,
    isLoading,
    error,
    mutate: swrMutate,
    createStage,
    reorderStages,
    deleteStage,
  };
}
