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
  if ((params as any).formId !== undefined) query.set('FormId', String((params as any).formId));

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
  const sellerType = item.sellerType ?? seller.sellerType ?? (seller.currentLicense && (seller.currentLicense.sellerType ?? seller.currentLicense.seller_type));
  
  // Extract license number from licenses array if available (could be at root or in seller)
  let licenseNumber: string | undefined;
  // Check for currentLicense on seller first (common shape), then licenses arrays
  if (seller && typeof seller === 'object' && seller.currentLicense) {
    const cl = seller.currentLicense as Record<string, unknown>;
    licenseNumber = String(cl.licenseNumber ?? cl.number ?? cl.license_number ?? '') || undefined;
    if (licenseNumber === '') licenseNumber = undefined;
  }
  if (!licenseNumber) {
    const licenses = (Array.isArray(item.licenses) ? item.licenses : undefined) || 
                     (Array.isArray(seller.licenses) ? seller.licenses : undefined);
    if (Array.isArray(licenses) && licenses.length > 0) {
      const firstLicense = licenses[0] as Record<string, unknown>;
      licenseNumber = firstLicense.number ? String(firstLicense.number) : undefined;
    }
  }

  return {
    id: Number(item.id ?? 0),
    sellerId: Number(item.sellerId ?? 0),
    formId: item.formId == null ? null : Number(item.formId),
    sellerFullName: String(item.sellerFullName ?? seller.fullName ?? seller.name ?? ''),
    sellerAfm: String(item.sellerAfm ?? seller.afm ?? seller.taxId ?? ''),
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

export async function createRequest(payload: Record<string, unknown> | FormData): Promise<void> {
  // If caller passed a FormData instance, send it as multipart/form-data
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    await http.post<void, FormData>('/requests', payload);
  } else {
    // Fallback: convert plain object to JSON body
    await http.post<void, Record<string, unknown>>('/requests', payload as Record<string, unknown>);
  }
}

export async function reviewFieldValue(requestId: string | number, fieldValueId: string | number, payload: { isApproved: boolean; adjustedScore: number; reviewNote: string }): Promise<void> {
  await http.post<void>(`/requests/${requestId}/field-reviews/${fieldValueId}`, payload);
}

export async function recalculateFieldReviews(requestId: string | number): Promise<void> {
  await http.post<void>(`/requests/${requestId}/field-reviews/recalculate`, {});
}

export async function setRequestStatus(id: string | number, payload: { status: number; reason: string; processedByUserId: string }): Promise<void> {
  await http.put<void>(`/requests/${id}/status`, payload);
}

export async function updateRequestScore(id: string | number, payload: { score: number | null; note?: string }): Promise<void> {
  await http.put<void>(`/requests/${id}/score`, payload);
}
