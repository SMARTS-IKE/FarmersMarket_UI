import { http } from '../lib/http';
import type {
  SellerRequest,
  SellerRequestListResponse,
  SubmittedRequestDocument,
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
  const response = await http.get<Record<string, unknown>>(`/requests/${id}`);

  return normalizeSubmittedRequestDetail(response);
}

function normalizeSubmittedRequestDocument(item: unknown): SubmittedRequestDocument {
  if (!item || typeof item !== 'object') {
    return {};
  }

  return { ...(item as SubmittedRequestDocument) };
}

function normalizeSubmittedRequestFieldValue(item: unknown): SubmittedRequestDetail['fieldValues'][number] {
  const field = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

  return {
    id: Number(field.id ?? 0),
    fieldId: Number(field.fieldId ?? 0),
    fieldLabel: String(field.fieldLabel ?? ''),
    value: field.value == null ? '' : String(field.value),
    weight: field.weight ? Number(field.weight) : undefined,
    reviewStatus: field.reviewStatus == null ? null : Number(field.reviewStatus),
    reviewComment: field.reviewComment == null ? null : String(field.reviewComment),
  };
}

function normalizeSubmittedRequestDetail(item: Record<string, unknown>): SubmittedRequestDetail {
  const markets = Array.isArray(item.markets)
    ? item.markets
    : Array.isArray(item.requestedMarkets)
      ? item.requestedMarkets
      : [];
  const fieldValues = Array.isArray(item.fieldValues) ? item.fieldValues : [];
  const documents = Array.isArray(item.documents) ? item.documents : [];
  
  // Extract seller data - could be at root level or nested in seller object
  const seller = item.seller && typeof item.seller === 'object' ? (item.seller as Record<string, unknown>) : {};
  const sellerType = item.sellerType ?? seller.sellerType;
  
  // Extract license number from licenses array if available (could be at root or in seller)
  let licenseNumber: string | undefined;
  const licenses = (Array.isArray(item.licenses) ? item.licenses : undefined) || 
                   (Array.isArray(seller.licenses) ? seller.licenses : undefined);
  if (Array.isArray(licenses) && licenses.length > 0) {
    const firstLicense = licenses[0] as Record<string, unknown>;
    licenseNumber = firstLicense.number ? String(firstLicense.number) : undefined;
  }

  return {
    id: Number(item.id ?? 0),
    sellerId: Number(item.sellerId ?? 0),
    formId: item.formId == null ? null : Number(item.formId),
    sellerFullName: String(item.sellerFullName ?? ''),
    sellerAfm: String(item.sellerAfm ?? ''),
    sellerType: sellerType,
    sellerLicenseNumber: licenseNumber,
    status: Number(item.status ?? 0) as SubmittedRequestDetail['status'],
    score: item.score == null ? null : Number(item.score),
    submittedAt: String(item.submittedAt ?? ''),
    processedAt: item.processedAt == null ? null : String(item.processedAt),
    rejectionReason: item.rejectionReason == null ? null : String(item.rejectionReason),
    notes: item.notes == null ? null : String(item.notes),
    markets: markets.map((market) => {
      const normalizedMarket = market && typeof market === 'object' ? (market as Record<string, unknown>) : {};

      return {
        marketId: Number(normalizedMarket.marketId ?? normalizedMarket.id ?? 0),
        marketName: String(normalizedMarket.marketName ?? normalizedMarket.name ?? normalizedMarket.marketTitle ?? normalizedMarket.title ?? ''),
      };
    }),
    fieldValues: fieldValues.map(normalizeSubmittedRequestFieldValue),
    documents: documents.map(normalizeSubmittedRequestDocument),
  };
}

export async function approveRequest(id: number): Promise<void> {
  await http.put<void>(`/requests/${id}/approve`, {});
}

export async function rejectRequest(id: number): Promise<void> {
  await http.put<void>(`/requests/${id}/reject`, {});
}

export async function deleteRequest(id: number): Promise<void> {
  await http.delete<void>(`/requests/${id}`);
}

export async function createRequest(payload: Record<string, unknown>): Promise<void> {
  await http.post<void>('/requests', payload);
}
