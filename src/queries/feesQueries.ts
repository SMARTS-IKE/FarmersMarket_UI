import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type { FeeRuleListResponse, FeeRuleSearchRequest, FeeRule } from '../models/fee';
import { getFeeRules, createFeeRule, getFeeRule, updateFeeRule } from '../services/feeService';

const FEES_STALE_TIME_MS = 5 * 60 * 1000;
const FEES_GC_TIME_MS = 15 * 60 * 1000;

export const feeKeys = {
  all: ['fees'] as const,
  list: (params: FeeRuleSearchRequest) => ['fees', 'list', params] as const,
  detail: (id: string | number) => ['fees', 'detail', id] as const,
};

export function useFeesQuery(params: FeeRuleSearchRequest) {
  return useQuery<FeeRuleListResponse, Error>({
    queryKey: feeKeys.list(params),
    queryFn: () => getFeeRules(params),
    staleTime: FEES_STALE_TIME_MS,
    gcTime: FEES_GC_TIME_MS,
  });
}

export function useCreateFeeRuleMutation() {
  return useMutation<void, Error, FeeRule>({
    mutationFn: (payload) => createFeeRule(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feeKeys.all });
    },
  });
}

export function useFeeRuleQuery(id: string | number | undefined) {
  return useQuery<FeeRule, Error>({
    queryKey: feeKeys.detail(id ?? ''),
    queryFn: async () => {
      if (id === undefined || id === null || id === '') throw new Error('No id');
      return getFeeRule(id as string | number);
    },
    staleTime: FEES_STALE_TIME_MS,
    enabled: !!id,
  });
}

export function useUpdateFeeRuleMutation() {
  return useMutation<void, Error, { id: string | number; payload: FeeRule }>({
    mutationFn: ({ id, payload }) => updateFeeRule(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feeKeys.all });
    },
  });
}
