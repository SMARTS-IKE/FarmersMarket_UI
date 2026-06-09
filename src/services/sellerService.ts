import { http } from '../lib/http';
import type { Seller, SellerSearchRequest, SellerListResponse } from '../models/seller';
import type { ConnectedMarketListResponse } from '../models/market';

export async function getSellers(params: SellerSearchRequest): Promise<SellerListResponse> {
  const query = new URLSearchParams();

  if (params.name) query.set('Name', params.name);
  if (params.afm) query.set('Afm', params.afm);
  if (params.sellerType) query.set('SellerType', String(params.sellerType));
  if (params.isActive !== undefined) query.set('IsActive', String(params.isActive));
  query.set('Page', String(params.page));
  query.set('PageSize', String(params.pageSize));

  const qs = query.toString();
  return http.get<SellerListResponse>(`/Sellers${qs ? `?${qs}` : ''}`);
}

export async function getSellerById(id: string): Promise<Seller> {
  return http.get<Seller>(`/Sellers/${id}`);
}

export async function getSellerMarkets(sellerId: string): Promise<ConnectedMarketListResponse> {
  return http.get<ConnectedMarketListResponse>(`/MarketSeller/seller/${sellerId}`);
}

export async function getMarketSellerById(id: string): Promise<ConnectedMarket> {
  return http.get<ConnectedMarket>(`/MarketSeller/${id}`);
}

export async function createLicense(
  sellerId: string,
  licenseData: {
    licenseNumber: string;
    licenseType: string;
    issuedAt: string;
    expiresAt: string;
  }
): Promise<void> {
  return http.post<void>(`/Sellers/${sellerId}/licenses`, licenseData);
}
