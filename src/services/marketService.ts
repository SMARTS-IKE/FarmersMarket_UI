import { http } from '../lib/http';
import type { DAY_NAME_TO_NUMBER, MarketApiRequest, MarketListResponse, MarketSearchRequest } from '../models/market';

function toApiRequest(params: MarketSearchRequest): MarketApiRequest {
  const req: MarketApiRequest = {
    Page: params.page,
    PageSize: params.pageSize,
  };

  if (params.name) req.name = params.name;
  if (params.marketType !== "") req.marketType = Number(params.marketType);

  // The API accepts a single day filter — use the first selected day if any
  if (params.operatingDays.length > 0) {
    const dayMap: typeof DAY_NAME_TO_NUMBER = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    req.day = dayMap[params.operatingDays[0]];
  }

  return req;
}

export async function getMarkets(params: MarketSearchRequest): Promise<MarketListResponse> {
  const apiParams = toApiRequest(params);
  const query = new URLSearchParams();

  if (apiParams.name) query.set('name', apiParams.name);
  if (apiParams.marketType !== undefined) query.set('marketType', String(apiParams.marketType));
  if (apiParams.day !== undefined) query.set('day', String(apiParams.day));
  if (apiParams.isActive !== undefined) query.set('isActive', String(apiParams.isActive));
  query.set('Page', String(apiParams.Page));
  query.set('PageSize', String(apiParams.PageSize));

  const qs = query.toString();
  return http.get<MarketListResponse>(`/Markets${qs ? `?${qs}` : ''}`);
}
