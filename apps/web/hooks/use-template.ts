'use client';

import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

import { apiPatch } from '@/lib/api';
import type { Template, TemplateUpdateRequest } from '@repo/contracts';

interface UseTemplateOptions {
  enabled?: boolean;
}

interface UseTemplateReturn {
  template: Template | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  updateTemplate: (payload: TemplateUpdateRequest) => Promise<Template>;
}

export function useTemplate(
  id: string,
  options: UseTemplateOptions = {},
): UseTemplateReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<Template>(enabled ? `/checklists/templates/${id}` : null);

  const invalidateAll = useCallback(() => {
    swrMutate();
    mutate(
      (key) =>
        typeof key === 'string' && key.startsWith('/checklists/templates'),
      undefined,
      { revalidate: true },
    );
  }, [swrMutate]);

  const updateTemplate = useCallback(
    async (payload: TemplateUpdateRequest) => {
      const result = await apiPatch<Template>(
        `/checklists/templates/${id}`,
        payload,
      );
      invalidateAll();
      return result;
    },
    [id, invalidateAll],
  );

  return {
    template: data,
    isLoading,
    error,
    mutate: swrMutate,
    updateTemplate,
  };
}
