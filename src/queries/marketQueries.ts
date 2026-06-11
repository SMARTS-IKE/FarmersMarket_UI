import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { addMarketSeller, addMarketSupervisor, createMarket, getMarketById, getMarketSellers, getMarkets, removeMarketSeller, updateMarket } from '../services/marketService';
import type { CreateMarketRequest, Market, MarketListResponse, MarketSearchRequest, UpdateMarketRequest, ConnectedMarketListResponse } from '../models/market';

const SELLERS_STALE_TIME_MS = 5 * 60 * 1000;
const SELLERS_GC_TIME_MS = 15 * 60 * 1000;


export const marketKeys = {
  all: ['markets'] as const,
  list: (params: MarketSearchRequest) => ['markets', 'list', params] as const,
  detail: (id: string) => ['markets', 'detail', id] as const,
  sellers: (id: string) => ['markets', 'detail', id, 'sellers'] as const,
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

export function useMarketSellersQuery(marketId: string) {
  return useQuery<ConnectedMarketListResponse, Error>({
    queryKey: marketKeys.sellers(marketId),
    queryFn: () => getMarketSellers(marketId),
    enabled: Boolean(marketId),
    staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}

export function useCreateMarketMutation() {
  return useMutation<Market, Error, CreateMarketRequest>({
    mutationFn: (payload) => createMarket(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketKeys.all });
    },
  });
}

export function useRemoveMarketSellerMutation(marketId: string) {
  return useMutation<void, Error, number>({
    mutationFn: (sellerId) => removeMarketSeller(marketId, sellerId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) }),
        queryClient.invalidateQueries({ queryKey: marketKeys.sellers(marketId) }),
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
        queryClient.invalidateQueries({ queryKey: marketKeys.sellers(marketId) }),
        queryClient.invalidateQueries({ queryKey: marketKeys.all }),
      ]);
    },
  });
}

export function useAddMarketSupervisorMutation(marketId: string) {
  return useMutation<void, Error, string>({
    mutationFn: (userId) => addMarketSupervisor(marketId, userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) }),
        queryClient.invalidateQueries({ queryKey: marketKeys.all }),
      ]);
    },
  });
}

export function useUpdateMarketMutation(marketId: string) {
  return useMutation<void, Error, UpdateMarketRequest>({
    mutationFn: (payload) => updateMarket(marketId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: marketKeys.detail(marketId) }),
        queryClient.invalidateQueries({ queryKey: marketKeys.all }),
      ]);
    },
  });
}
