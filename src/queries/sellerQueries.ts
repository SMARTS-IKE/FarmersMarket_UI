import { useQuery } from '@tanstack/react-query';
import type { SellerSearchRequest, SellerListResponse, Seller } from '../models/seller';
import { getSellerById, getSellers } from '../services/sellerService';

const SELLERS_STALE_TIME_MS = 5 * 60 * 1000;
const SELLERS_GC_TIME_MS = 15 * 60 * 1000;

export const sellerKeys = {
  all: ['sellers'] as const,
  list: (params: SellerSearchRequest) => ['sellers', 'list', params] as const,
  detail: (id: string) => ['sellers', 'detail', id] as const,
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
  return useQuery<Seller, Error>({
    queryKey: sellerKeys.detail(id),
    queryFn: () => getSellerById(id),
    enabled: Boolean(id),
    staleTime: SELLERS_STALE_TIME_MS,
    gcTime: SELLERS_GC_TIME_MS,
  });
}
