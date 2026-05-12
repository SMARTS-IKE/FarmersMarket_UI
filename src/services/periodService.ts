import { http } from '../lib/http';
import type {
  CreateMarketPeriodRequest,
  MarketPeriod,
  MarketPeriodDetail,
  UpdateMarketPeriodRequest,
} from '../models/request';

export async function createMarketPeriod(payload: CreateMarketPeriodRequest): Promise<MarketPeriod> {
  return http.post<MarketPeriod, CreateMarketPeriodRequest>('/periods', payload);
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value !== 0;
  return false;
}

function toStringValue(value: unknown): string {
  return value == null ? '' : String(value);
}

function normalizeMarketPeriodDetail(item: Record<string, unknown>): MarketPeriodDetail {
  return {
    id: Number(item.id ?? 0),
    marketId: Number(item.marketId ?? 0),
    marketName: item.marketName == null ? undefined : String(item.marketName),
    title: toStringValue(item.title),
    description: toStringValue(item.description),
    licenseCategory: (Number(item.licenseCategory ?? 0) || 0) as 0 | 1 | 2,
    submissionStart: toStringValue(item.submissionStart),
    submissionEnd: toStringValue(item.submissionEnd),
    operationStart: toStringValue(item.operationStart),
    operationEnd: toStringValue(item.operationEnd),
    availableSpots: Number(item.availableSpots ?? 0),
    lotteryEnabled: normalizeBoolean(item.lotteryEnabled),
    lotteryDate: toStringValue(item.lotteryDate),
    formId: item.formId == null || item.formId === '' ? null : Number(item.formId),
  };
}

export async function getMarketPeriodById(id: string): Promise<MarketPeriodDetail> {
  const response = await http.get<Record<string, unknown>>(`/periods/${id}`);
  return normalizeMarketPeriodDetail(response);
}

export async function updateMarketPeriod(id: string, payload: UpdateMarketPeriodRequest): Promise<MarketPeriod> {
  return http.put<MarketPeriod, UpdateMarketPeriodRequest>(`/periods/${id}`, payload);
}
