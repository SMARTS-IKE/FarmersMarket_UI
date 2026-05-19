import { http } from '../lib/http';
import type { FeeRule, FeeRuleListResponse, FeeRuleSearchRequest, FeeRuleApiRequest } from '../models/fee';

function toApiRequest(params: FeeRuleSearchRequest): FeeRuleApiRequest {
  const req: FeeRuleApiRequest = {
    Page: params.page,
    PageSize: params.pageSize,
  };

  if (params.marketId !== undefined && params.marketId !== '') {
    req.MarketId = Number(params.marketId);
  }
  if (params.sellerType) {
    req.SellerType = params.sellerType;
  }

  return req;
}

export async function getFeeRules(params: FeeRuleSearchRequest): Promise<FeeRuleListResponse> {
  const apiParams = toApiRequest(params);
  const query = new URLSearchParams();

  if (apiParams.MarketId !== undefined) query.set('MarketId', String(apiParams.MarketId));
  if (apiParams.SellerType) query.set('SellerType', apiParams.SellerType);
  query.set('Page', String(apiParams.Page));
  query.set('PageSize', String(apiParams.PageSize));

  const qs = query.toString();
  const response = await http.get<FeeRuleListResponse | FeeRule[]>(`/fee-rules${qs ? `?${qs}` : ''}`);

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
