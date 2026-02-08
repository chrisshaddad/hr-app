'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { apiPost, apiPatch, apiDelete } from '@/lib/api';
import type {
  TagListResponse,
  TagDetailResponse,
  CreateTagRequest,
  UpdateTagRequest,
} from '@repo/contracts';

interface UseTagsOptions {
  enabled?: boolean;
}

interface UseTagsReturn {
  tags: TagListResponse['tags'] | undefined;
  total: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  createTag: (data: CreateTagRequest) => Promise<TagDetailResponse>;
  updateTag: (id: string, data: UpdateTagRequest) => Promise<TagDetailResponse>;
  deleteTag: (id: string) => Promise<void>;
}

export function useTags(options: UseTagsOptions = {}): UseTagsReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<TagListResponse>(enabled ? '/tags' : null);

  const invalidateAll = useCallback(() => {
    swrMutate();
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/tags'),
      undefined,
      { revalidate: true },
    );
  }, [swrMutate]);

  const createTag = useCallback(
    async (createData: CreateTagRequest) => {
      const result = await apiPost<TagDetailResponse>('/tags', createData);
      invalidateAll();
      return result;
    },
    [invalidateAll],
  );

  const updateTag = useCallback(
    async (id: string, updateData: UpdateTagRequest) => {
      const result = await apiPatch<TagDetailResponse>(
        `/tags/${id}`,
        updateData,
      );
      invalidateAll();
      return result;
    },
    [invalidateAll],
  );

  const deleteTag = useCallback(
    async (id: string) => {
      await apiDelete(`/tags/${id}`);
      invalidateAll();
    },
    [invalidateAll],
  );

  return {
    tags: data?.tags,
    total: data?.total,
    isLoading,
    error,
    mutate: swrMutate,
    createTag,
    updateTag,
    deleteTag,
  };
}
