import { http } from '../lib/http';
import type {
  MarketPeriod,
  MarketPeriodListResponse,
  MarketPeriodSearchRequest,
  MarketPeriodStatus,
  SellerRequest,
  SellerRequestListResponse,
  SellerRequestSearchRequest,
  SubmittedRequestDetail,
} from '../models/request';

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

export async function getSubmittedRequestById(id: string | number): Promise<SubmittedRequestDetail> {
  return await http.get<SubmittedRequestDetail>(`/requests/${id}`);
}

function normalizeMarketPeriodStatus(value: unknown): MarketPeriodStatus {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();

    if (normalized === 'draft' || normalized === 'scheduled' || normalized === 'active' || normalized === 'closed') {
      return normalized;
    }
  }

  if (typeof value === 'number') {
    const labels: Record<number, MarketPeriodStatus> = {
      0: 'draft',
      1: 'scheduled',
      2: 'active',
      3: 'closed',
    };

    return labels[value] ?? 'draft';
  }

  return 'draft';
}

function normalizeMarketPeriod(item: Record<string, unknown>): MarketPeriod {
  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? item.name ?? `Περίοδος ${String(item.id ?? '')}`),
    marketName: String(item.marketName ?? item.market ?? item.marketTitle ?? '-'),
    startDate: String(item.startDate ?? item.startsAt ?? ''),
    endDate: String(item.endDate ?? item.endsAt ?? ''),
    status: normalizeMarketPeriodStatus(item.status),
    marketId: Number(item.marketId ?? 0),
    formId: Number(item.formId ?? 0),
    formTitle: String(item.formTitle ?? ''),
    description: item.description == null ? null : String(item.description),
    licenseCategory: (Number(item.licenseCategory ?? 0) || 0) as 0 | 1 | 2,
    submissionStart: String(item.submissionStart ?? ''),
    submissionEnd: String(item.submissionEnd ?? ''),
    operationStart: String(item.operationStart ?? ''),
    operationEnd: String(item.operationEnd ?? ''),
    availableSpots: Number(item.availableSpots ?? 0),
    totalRequests: Number(item.totalRequests ?? 0),
    lotteryEnabled:
      typeof item.lotteryEnabled === 'boolean'
        ? item.lotteryEnabled
        : String(item.lotteryEnabled ?? '').toLowerCase() === 'true',
    lotteryDate: item.lotteryDate == null ? null : String(item.lotteryDate),
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? ''),
  };
}

export async function getMarketPeriods(params: MarketPeriodSearchRequest): Promise<MarketPeriodListResponse> {
  const query = new URLSearchParams();

  if (params.market) query.set('Market', params.market);
  if (params.status) query.set('Status', String(params.status));
  query.set('Page', String(params.page));
  query.set('PageSize', String(params.pageSize));

  const qs = query.toString();
  const response = await http.get<MarketPeriodListResponse | MarketPeriod[] | Record<string, unknown>>(
    `/periods${qs ? `?${qs}` : ''}`
  );

  if (Array.isArray(response)) {
    return {
      items: response.map((item) => normalizeMarketPeriod(item as unknown as Record<string, unknown>)),
      totalCount: response.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  const responseRecord = response as Record<string, unknown>;
  const items = Array.isArray(responseRecord.items)
    ? responseRecord.items.map((item) => normalizeMarketPeriod(item as Record<string, unknown>))
    : [];

  return {
    items,
    totalCount: Number(responseRecord.totalCount ?? items.length),
    page: Number(responseRecord.page ?? params.page),
    pageSize: Number(responseRecord.pageSize ?? params.pageSize),
  };
}
