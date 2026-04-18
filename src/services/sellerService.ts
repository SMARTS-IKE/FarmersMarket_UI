import { http } from '../lib/http';
import type { SellerSearchRequest, SellerListResponse } from '../models/seller';

export async function getSellers(params: SellerSearchRequest): Promise<SellerListResponse> {
  const query = new URLSearchParams();

  if (params.name) query.set('Name', params.name);
  if (params.afm) query.set('Afm', params.afm);
  query.set('SellerType', String(params?.sellerType || '0'));
  if (params.isActive !== undefined) query.set('IsActive', String(params.isActive));
  query.set('Page', String(params.page));
  query.set('PageSize', String(params.pageSize));

  const qs = query.toString();
  return http.get<SellerListResponse>(`/Sellers${qs ? `?${qs}` : ''}`);
}
