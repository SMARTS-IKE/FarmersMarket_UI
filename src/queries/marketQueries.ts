import { useQuery } from '@tanstack/react-query';
import type { MarketListResponse, MarketSearchRequest } from '../models/market';
import { getMarkets } from '../services/marketService';

export const marketKeys = {
  all: ['markets'] as const,
  list: (params: MarketSearchRequest) => ['markets', 'list', params] as const,
};

export function useMarketsQuery(params: MarketSearchRequest) {
  return useQuery<MarketListResponse, Error>({
    queryKey: marketKeys.list(params),
    queryFn: () => getMarkets(params),
  });
}
