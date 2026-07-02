import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type { SellerSearchRequest, SellerListResponse, Seller } from '../models/seller';
import type { ConnectedMarket, ConnectedMarketListResponse } from '../models/market';
import { getSellerById, getSellers, getSellerMarkets, getMarketSellerById } from '../services/sellerService';
import { updateMarketSeller } from '../services/sellerService';

const SELLERS_STALE_TIME_MS = 5 * 60 * 1000;
const SELLERS_GC_TIME_MS = 15 * 60 * 1000;

export const sellerKeys = {
  all: ['sellers'] as const,
  list: (params: SellerSearchRequest) => ['sellers', 'list', params] as const,
  detail: (id: string) => ['sellers', 'detail', id] as const,
  markets: (id: string) => ['sellers', 'markets', id] as const,
  marketDetail: (id: string) => ['sellers', 'marketDetail', id] as const,
};

export function useSellersQuery(params: SellerSearchRequest) {
  return useQuery<SellerListResponse, Error>({
    queryKey: sellerKeys.list(params),
    queryFn: () => getSellers(params),
    staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}

export function useSellerQuery(id: string) {
  return useQuery<Seller | null, Error>({
    queryKey: sellerKeys.detail(id),
    queryFn: () => getSellerById(id),
    enabled: Boolean(id),
    staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}

export function useSellerMarketsQuery(id: string) {
  return useQuery<ConnectedMarketListResponse, Error>({
    queryKey: sellerKeys.markets(id),
    queryFn: () => getSellerMarkets(id),
    enabled: Boolean(id),
    staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}

export function useMarketSellerQuery(id: string) {
  return useQuery<ConnectedMarket, Error>({
    queryKey: sellerKeys.marketDetail(id),
    queryFn: () => getMarketSellerById(id),
    enabled: Boolean(id),
    staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}

export function useUpdateMarketSellerMutation(marketConnectionId: string) {
  return useMutation<void, Error, Partial<ConnectedMarket>>({
    mutationFn: (payload) => updateMarketSeller(marketConnectionId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sellerKeys.marketDetail(marketConnectionId) }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.markets(String(marketConnectionId)) }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.all }),
      ]);
    },
  });
}
