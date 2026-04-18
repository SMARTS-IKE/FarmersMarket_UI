import { useQuery } from '@tanstack/react-query';
import type { SellerSearchRequest, SellerListResponse } from '../models/seller';
import { getSellers } from '../services/sellerService';

export const sellerKeys = {
  all: ['sellers'] as const,
  list: (params: SellerSearchRequest) => ['sellers', 'list', params] as const,
};

export function useSellersQuery(params: SellerSearchRequest) {
  return useQuery<SellerListResponse, Error>({
    queryKey: sellerKeys.list(params),
    queryFn: () => getSellers(params),
  });
}
