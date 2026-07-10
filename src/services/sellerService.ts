import { http } from '../lib/http';
import type { Seller, SellerSearchRequest, SellerListResponse } from '../models/seller';
import type { ConnectedMarketListResponse } from '../models/market';

export async function getSellers(params: SellerSearchRequest): Promise<SellerListResponse> {
  const query = new URLSearchParams();

  if (params.name) query.set('Name', params.name);
  if (params.afm) query.set('Afm', params.afm);
  // sellerType can be 0 which is falsy — explicitly check for empty string instead
  if (params.sellerType !== "") query.set('SellerType', String(params.sellerType));
  if (params.isActive !== undefined) query.set('IsActive', String(params.isActive));
  query.set('Page', String(params.page));
  query.set('PageSize', String(params.pageSize));

  const qs = query.toString();
  return http.get<SellerListResponse>(`/Sellers${qs ? `?${qs}` : ''}`);
}

export async function getAllSellers(params: Omit<SellerSearchRequest, 'page' | 'pageSize'> & { pageSize?: number } = { name: '', afm: '', sellerType: '', pageSize: 1000 }): Promise<SellerListResponse> {
  const pageSize = params.pageSize ?? 1000;
  let page = 1;
  let accumulated: Seller[] = [];
  let totalCount = 0;
  const maxPages = 200; // safety cap to avoid infinite loops

  while (page <= maxPages) {
    // reuse getSellers to leverage the same query params formatting
    const resp = await getSellers({
      name: (params as any).name ?? '',
      afm: (params as any).afm ?? '',
      sellerType: (params as any).sellerType ?? '',
      page,
      pageSize,
      isActive: (params as any).isActive,
    } as SellerSearchRequest);

    console.log('getAllSellers page response', { page, itemsLength: Array.isArray(resp?.items) ? resp.items.length : 0, totalCount: resp?.totalCount, resp });

    if (!resp || !Array.isArray(resp.items)) break;

    accumulated = accumulated.concat(resp.items);
    totalCount = resp.totalCount ?? accumulated.length;

    if (accumulated.length >= totalCount) break;
    if (resp.items.length < pageSize) break;

    page += 1;
  }

  return {
    items: accumulated,
    totalCount,
    page: 1,
    pageSize: accumulated.length,
  };
}

export async function getSellerById(id: string): Promise<Seller | null> {
  try {
    return await http.get<Seller>(`/Sellers/${id}`);
  } catch (err: any) {
    // If the API returns 404 (seller not found), treat as "no seller" and return null.
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function getSellerMarkets(sellerId: string): Promise<ConnectedMarketListResponse> {
  return http.get<ConnectedMarketListResponse>(`/MarketSeller/seller/${sellerId}`);
}

export async function getMarketSellerById(id: string): Promise<ConnectedMarket> {
  return http.get<ConnectedMarket>(`/MarketSeller/${id}`);
}

export async function updateMarketSeller(id: string, data: Partial<ConnectedMarket>): Promise<void> {
  return http.put<void, Partial<ConnectedMarket>>(`/MarketSeller/${id}`, data);
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

export async function updateSeller(
  id: string,
  data: {
    seller: {
      phone?: string | null;
      address?: string | null;
    };
    license: {
      fromDate: string;
      sellerType: number;
      isSeasonal: boolean;
      seasonalFromDate?: string | null;
      seasonalToDate?: string | null;
      licenseCategory: number;
      licenseStatus: number;
      licenseNumber: string;
      licenseExpiry?: string | null;
      notes?: string | null;
    };
  }
): Promise<void> {
  return http.put<void>(`/Sellers/${id}`, data);
}
