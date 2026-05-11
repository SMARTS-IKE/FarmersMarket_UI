import { useQuery } from '@tanstack/react-query';
import type { SellerRequest, SellerRequestSearchRequest } from '../models/request';
import { getSellerRequests } from '../services/requestService';

const REQUESTS_STALE_TIME_MS = 5 * 60 * 1000;
const REQUESTS_GC_TIME_MS = 15 * 60 * 1000;

export const requestKeys = {
  all: ['requests'] as const,
  sellerList: (params: SellerRequestSearchRequest) => ['requests', 'seller-list', params] as const,
};

export function useSellerRequestsQuery(params: SellerRequestSearchRequest) {
  return useQuery<SellerRequest[], Error>({
    queryKey: requestKeys.sellerList(params),
    queryFn: () => getSellerRequests(params),
    staleTime: REQUESTS_STALE_TIME_MS,
    gcTime: REQUESTS_GC_TIME_MS,
  });
}
