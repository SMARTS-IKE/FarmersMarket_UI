import { useQuery } from '@tanstack/react-query';
import type { Market, MarketListResponse, MarketSearchRequest } from '../models/market';
import { getMarketById, getMarkets } from '../services/marketService';

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
  });
}
