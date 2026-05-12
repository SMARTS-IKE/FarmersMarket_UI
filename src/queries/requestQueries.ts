import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type {
  CreateMarketPeriodRequest,
  MarketPeriodDetail,
  MarketPeriod,
  MarketPeriodListResponse,
  MarketPeriodSearchRequest,
  SellerRequest,
  SellerRequestSearchRequest,
  UpdateMarketPeriodRequest,
} from '../models/request';
import { createMarketPeriod, getMarketPeriodById, updateMarketPeriod } from '../services/periodService';
import { getMarketPeriods, getSellerRequests } from '../services/requestService';

const REQUESTS_STALE_TIME_MS = 5 * 60 * 1000;
const REQUESTS_GC_TIME_MS = 15 * 60 * 1000;

export const requestKeys = {
  all: ['requests'] as const,
  sellerList: (params: SellerRequestSearchRequest) => ['requests', 'seller-list', params] as const,
  marketPeriods: (params: MarketPeriodSearchRequest) => ['requests', 'market-periods', params] as const,
  marketPeriodDetail: (id: string) => ['requests', 'market-period-detail', id] as const,
};

export function useSellerRequestsQuery(params: SellerRequestSearchRequest) {
  return useQuery<SellerRequest[], Error>({
    queryKey: requestKeys.sellerList(params),
    queryFn: () => getSellerRequests(params),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}

export function useMarketPeriodsQuery(params: MarketPeriodSearchRequest) {
  return useQuery<MarketPeriodListResponse, Error>({
    queryKey: requestKeys.marketPeriods(params),
    queryFn: () => getMarketPeriods(params),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}

export function useCreateMarketPeriodMutation() {
  return useMutation<MarketPeriod, Error, CreateMarketPeriodRequest>({
    mutationFn: (payload) => createMarketPeriod(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests', 'market-periods'] });
    },
  });
}

export function useMarketPeriodDetailQuery(id: string) {
  return useQuery<MarketPeriodDetail, Error>({
    queryKey: requestKeys.marketPeriodDetail(id),
    queryFn: () => getMarketPeriodById(id),
    enabled: Boolean(id),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}

export function useUpdateMarketPeriodMutation(id: string) {
  return useMutation<MarketPeriod, Error, UpdateMarketPeriodRequest>({
    mutationFn: (payload) => updateMarketPeriod(id, payload),
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<MarketPeriodDetail | undefined>(requestKeys.marketPeriodDetail(id), (current) => {
        if (!current) return current;

        return {
          ...current,
          marketId: variables.marketId,
          title: variables.title ?? current.title,
          description: variables.description ?? current.description,
          licenseCategory: variables.licenseCategory,
          submissionStart: variables.submissionStart,
          submissionEnd: variables.submissionEnd,
          operationStart: variables.operationStart ?? '',
          operationEnd: variables.operationEnd ?? '',
          availableSpots: variables.availableSpots,
          lotteryEnabled: variables.lotteryEnabled,
          lotteryDate: variables.lotteryDate ?? '',
          formId: variables.formId ?? null,
        };
      });

      await queryClient.invalidateQueries({ queryKey: ['requests', 'market-periods'] });
    },
  });
}
