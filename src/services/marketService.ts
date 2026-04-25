import { http } from '../lib/http';
import { DAY_NAME_TO_NUMBER, type Market, type MarketApiRequest, type MarketListResponse, type MarketSearchRequest } from '../models/market';

function toApiRequest(params: MarketSearchRequest): MarketApiRequest {
  const req: MarketApiRequest = {
    Page: params.page,
    PageSize: params.pageSize,
  };

  if (params.name) req.name = params.name;
  if (params.marketType !== "") req.marketType = Number(params.marketType);

  // The API accepts a single day filter — use the first selected day if any
  if (params.operatingDays.length > 0) {
    req.day = DAY_NAME_TO_NUMBER[params.operatingDays[0]];
  }

  return req;
}

export async function getMarkets(params: MarketSearchRequest): Promise<MarketListResponse> {
  const apiParams = toApiRequest(params);
  const query = new URLSearchParams();

  if (apiParams.name) query.set('Name', apiParams.name);
  if (apiParams.marketType !== undefined) query.set('MarketType', String(apiParams.marketType));
  if (apiParams.day !== undefined) query.set('Day', String(apiParams.day));
  if (apiParams.isActive !== undefined) query.set('IsActive', String(apiParams.isActive));
  query.set('Page', String(apiParams.Page));
  query.set('PageSize', String(apiParams.PageSize));

  const qs = query.toString();
  const response = await http.get<MarketListResponse | Market[]>(`/Markets${qs ? `?${qs}` : ''}`);

  if (Array.isArray(response)) {
    return {
      items: response,
      totalCount: response.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  return response;
}

export async function getMarketById(id: string): Promise<Market> {
  return http.get<Market>(`/Markets/${id}`);
}
