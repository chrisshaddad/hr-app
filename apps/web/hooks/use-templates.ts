'use client';

import useSWR from 'swr';
import { buildQuery } from '@/lib/utils';
import type { Template, TemplateType } from '@repo/contracts';

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

  return {
    templates: data?.templates ?? [],
    total: data?.total ?? 0,
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,
  };
}
