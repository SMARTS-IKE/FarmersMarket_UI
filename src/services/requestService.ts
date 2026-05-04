import { http } from '../lib/http';
import type { SellerRequest, SellerRequestListResponse, SellerRequestSearchRequest } from '../models/request';

export async function getSellerRequests(params: SellerRequestSearchRequest): Promise<SellerRequest[]> {
  const query = new URLSearchParams();

  if (params.sellerId !== undefined) query.set('SellerId', String(params.sellerId));
  if (params.status !== undefined) query.set('Status', String(params.status));

  const qs = query.toString();
  const response = await http.get<SellerRequestListResponse | SellerRequest[]>(`/Requests${qs ? `?${qs}` : ''}`);

  if (Array.isArray(response)) {
    return response;
  }

  return response.items;
}
