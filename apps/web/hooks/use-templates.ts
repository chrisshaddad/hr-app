'use client';

import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

import { apiPost, apiDelete, apiPatch } from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import type {
  Template,
  TemplateCreateRequest,
  TemplateType,
  TemplateUpdateRequest,
} from '@repo/contracts';

interface UseTemplatesOptions {
  type?: TemplateType;
  page?: number;
  limit?: number;
}

interface UseTemplatesReturn {
  templates: Template[];
  total: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  mutate: () => void;
  updateTemplate: (
    id: string,
    payload: TemplateUpdateRequest,
  ) => Promise<Template>;
  createTemplate: (payload: TemplateCreateRequest) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function useTemplates(
  options: UseTemplatesOptions = {},
): UseTemplatesReturn {
  const { type, page = 1, limit = 20 } = options;

  const queryString = buildQuery({ type, page, limit });
  const endpoint = `/checklists/templates${queryString ? `?${queryString}` : ''}`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: swrMutate,
  } = useSWR<{ templates: Template[]; total: number }>(endpoint);

  const invalidateAll = useCallback(() => {
    swrMutate();
    mutate(
      (key) =>
        typeof key === 'string' && key.startsWith('/checklists/templates'),
      undefined,
      { revalidate: true },
    );
  }, [swrMutate]);

  const createTemplate = useCallback(
    async (payload: TemplateCreateRequest) => {
      const result = await apiPost<Template>('/checklists/templates', payload);
      invalidateAll();
      return result;
    },
    [invalidateAll],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await apiDelete(`/checklists/templates/${id}`);
      invalidateAll();
    },
    [invalidateAll],
  );

  const updateTemplate = useCallback(
    async (id: string, payload: TemplateUpdateRequest) => {
      const result = await apiPatch<Template>(
        `/checklists/templates/${id}`,
        payload,
      );
      invalidateAll();
      return result;
    },
    [invalidateAll],
  );

  return {
    templates: data?.templates ?? [],
    total: data?.total ?? 0,
    isLoading,
    isValidating,
    error,
    deleteTemplate,
    mutate: swrMutate,
    createTemplate,
    updateTemplate,
  };
}
