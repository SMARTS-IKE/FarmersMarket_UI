import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type { Market, MarketListResponse, MarketSearchRequest } from '../models/market';
import { addMarketSeller, getMarketById, getMarkets, removeMarketSeller } from '../services/marketService';

const SELLERS_STALE_TIME_MS = 5 * 60 * 1000;
const SELLERS_GC_TIME_MS = 15 * 60 * 1000;


export const marketKeys = {
  all: ['markets'] as const,
  list: (params: MarketSearchRequest) => ['markets', 'list', params] as const,
  detail: (id: string) => ['markets', 'detail', id] as const,
};

export function useMarketsQuery(params: MarketSearchRequest) {
  return useQuery<MarketListResponse, Error>({
    queryKey: marketKeys.list(params),
    queryFn: () => getMarkets(params),
  });
}

export function useMarketQuery(id: string) {
  return useQuery<Market, Error>({
    queryKey: marketKeys.detail(id),
    queryFn: () => getMarketById(id),
    enabled: Boolean(id),
     staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}

export function useRemoveMarketSellerMutation(marketId: string) {
  return useMutation<void, Error, number>({
    mutationFn: (sellerId) => removeMarketSeller(marketId, sellerId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) }),
        queryClient.invalidateQueries({ queryKey: marketKeys.all }),
      ]);
    },
  });
}

export function useAddMarketSellerMutation(marketId: string) {
  return useMutation<void, Error, { sellerId: number; spotNumber: number; spotLength: number }>({
    mutationFn: (payload) => addMarketSeller(marketId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) }),
        queryClient.invalidateQueries({ queryKey: marketKeys.all }),
      ]);
    },
  });
}
