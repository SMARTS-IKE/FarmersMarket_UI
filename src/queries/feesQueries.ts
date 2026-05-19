import { useQuery } from '@tanstack/react-query';
import type { FeeRuleListResponse, FeeRuleSearchRequest } from '../models/fee';
import { getFeeRules } from '../services/feeService';

const FEES_STALE_TIME_MS = 5 * 60 * 1000;
const FEES_GC_TIME_MS = 15 * 60 * 1000;

export const feeKeys = {
  all: ['fees'] as const,
  list: (params: FeeRuleSearchRequest) => ['fees', 'list', params] as const,
};

export function useFeesQuery(params: FeeRuleSearchRequest) {
  return useQuery<FeeRuleListResponse, Error>({
    queryKey: feeKeys.list(params),
    queryFn: () => getFeeRules(params),
    staleTime: FEES_STALE_TIME_MS,
    gcTime: FEES_GC_TIME_MS,
  });
}
