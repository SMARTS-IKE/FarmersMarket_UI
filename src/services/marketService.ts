import { http } from '../lib/http';
import {
  DAY_NAME_TO_NUMBER,
  type Market,
  type MarketApiRequest,
  type MarketCurrentHistory,
  type MarketLocation,
  type MarketListResponse,
  type MarketSearchRequest,
  type UpdateMarketRequest,
} from '../models/market';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
  }

  return '';
}

function normalizeLocations(rawLocations: unknown): MarketLocation[] {
  if (!Array.isArray(rawLocations)) return [];

  return rawLocations
    .map((entry) => {
      const record = asRecord(entry);
      if (!record) return null;

      const latitude = readNumber(record, ['latitude', 'Latitude', 'lat', 'Lat']);
      const longitude = readNumber(record, ['longitude', 'Longitude', 'lng', 'lon', 'Lng', 'Lon']);
      if (latitude === null || longitude === null) return null;

      return { latitude, longitude };
    })
    .filter((entry): entry is MarketLocation => entry !== null);
}

function normalizeCurrentHistory(rawHistory: unknown): MarketCurrentHistory | null {
  const record = asRecord(rawHistory);
  if (!record) return null;

  return {
    id: readNumber(record, ['id']) ?? 0,
    fromDate: readString(record, ['fromDate']) || '',
    toDate: readString(record, ['toDate']) || null,
    isActive: Boolean(record.isActive),
    capacity: readNumber(record, ['capacity']) ?? 0,
    licenseCategory: readNumber(record, ['licenseCategory']) ?? 0,
    lotteryEnabled: Boolean(record.lotteryEnabled),
    dailyFee: readNumber(record, ['dailyFee']) ?? 0,
    openTime: readString(record, ['openTime']) || '',
    closeTime: readString(record, ['closeTime']) || '',
    notes: readString(record, ['notes']) || '',
    createdAt: readString(record, ['createdAt']) || '',
  };
}

function normalizeMarketDetailResponse(raw: unknown): Market {
  const record = asRecord(raw) ?? {};
  const locations = normalizeLocations(
    record.locations ??
    record.Locations ??
    record.marketLocations ??
    record.market_locations ??
    record.points
  );
  const fallbackLatitude = locations[0]?.latitude ?? 0;
  const fallbackLongitude = locations[0]?.longitude ?? 0;

  return {
    id: readNumber(record, ['id']) ?? 0,
    name: readString(record, ['name']) || '',
    marketType: (readNumber(record, ['marketType']) ?? 0) as Market['marketType'],
    address: readString(record, ['address']) || '',
    area: readString(record, ['area']) || '',
    createdAt: readString(record, ['createdAt']) || undefined,
    latitude: readNumber(record, ['latitude', 'Latitude', 'lat', 'Lat']) ?? fallbackLatitude,
    longitude: readNumber(record, ['longitude', 'Longitude', 'lng', 'lon', 'Lng', 'Lon']) ?? fallbackLongitude,
    locations,
    totalSpots: readNumber(record, ['totalSpots', 'capacity']) ?? 
                normalizeCurrentHistory(record.currentHistory)?.capacity ?? 
                undefined,
    occupiedSpots: readNumber(record, ['occupiedSpots']) ?? undefined,
    openTime: readString(record, ['openTime']) || undefined,
    closeTime: readString(record, ['closeTime']) || undefined,
    notes: readString(record, ['notes']) || undefined,
    isActive: typeof record.isActive === 'boolean' ? record.isActive : true,
    schedules: Array.isArray(record.schedules) ? (record.schedules as Market['schedules']) : [],
    marketSellers: Array.isArray(record.marketSellers) ? record.marketSellers : [],
    supervisors: Array.isArray(record.supervisors) ? (record.supervisors as Market['supervisors']) : [],
    currentHistory: normalizeCurrentHistory(record.currentHistory),
  };
}

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
      items: response.map(normalizeMarketDetailResponse),
      totalCount: response.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  return {
    ...response,
    items: response.items.map(normalizeMarketDetailResponse),
  };
}

export async function getMarketById(id: string): Promise<Market> {
  const response = await http.get<unknown>(`/Markets/${id}`);
  return normalizeMarketDetailResponse(response);
}

export async function createMarket(payload: CreateMarketRequest): Promise<Market> {
  const response = await http.post<unknown, CreateMarketRequest>('/Markets', payload);
  return normalizeMarketDetailResponse(response);
}

export async function updateMarket(id: string, payload: UpdateMarketRequest): Promise<void> {
  await http.put<void, UpdateMarketRequest["info"]>(`/markets/${id}/info`, payload.info);
  await http.put<void, UpdateMarketRequest["configuration"]>(`/markets/${id}/configuration`, payload.configuration);
}

export async function addMarketSeller(
  marketId: string,
  payload: { sellerId: number; spotNumber: number; spotLength: number; fromDate?: string; notes?: string }
): Promise<void> {
  // Use manual assignment endpoint which accepts full payload
  const body = {
    marketId: Number(marketId),
    sellerId: payload.sellerId,
    fromDate: payload.fromDate ?? undefined,
    spotLength: payload.spotLength,
    spotNumber: payload.spotNumber,
    notes: payload.notes ?? "",
  };

  return http.post<void, typeof body>(`/MarketSeller/assign_manually`, body);
}

export async function removeMarketSeller(marketId: string, sellerId: number): Promise<void> {
  return http.delete<void>(`/Markets/${marketId}/sellers/${sellerId}`);
}

export async function getMarketSellers(marketId: string): Promise<ConnectedMarketListResponse> {
  return http.get<ConnectedMarketListResponse>(`/MarketSeller/market/${marketId}`);
}

export async function addMarketSupervisor(marketId: string, userId: string): Promise<void> {
  return http.post<void, null>(`/Markets/${marketId}/supervisors/${userId}`, null);
}
