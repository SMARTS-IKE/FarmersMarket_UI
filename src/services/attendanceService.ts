import { http } from "../lib/http";
import type {
  AttendanceListResponse,
  AttendanceRecord,
  AttendanceSearchRequest,
} from "../models/attendance";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function resolveRecordedBy(record: Record<string, unknown>): { recordedByUserId: number | string | null; recordedByName: string } {
  const recordedByUserIdFromNumber = readNumber(record, ["recordedByUserId", "recorded_by_user_id"]);
  const recordedByUserIdFromString = readString(record, ["recordedByUserId", "recorded_by_user_id"]);
  const recordedByUserId = recordedByUserIdFromNumber ?? recordedByUserIdFromString ?? null;

  const recordedByRecord =
    asRecord(record.recordedBy) ??
    asRecord(record.recordedByUser) ??
    asRecord(record.marketSupervisor) ??
    asRecord(record.supervisor) ??
    asRecord(record.user);

  const recordedByName =
    readString(record, ["recordedByName", "recordedByFullName"]) ||
    (recordedByRecord
      ? `${readString(recordedByRecord, ["firstName", "name"])} ${readString(recordedByRecord, ["lastName", "surname"])} `.trim()
      : "") ||
    (recordedByUserId !== null ? `Επόπτης: #${recordedByUserId}` : "-");

  return { recordedByUserId, recordedByName };
}

function normalizeAttendanceRecord(raw: unknown): AttendanceRecord | null {
  const record = asRecord(raw);
  if (!record) return null;

  const sellerRecord = asRecord(record.seller) ?? asRecord(record.sellerInfo) ?? asRecord(record.sellerDetails);
  const marketRecord = asRecord(record.market) ?? asRecord(record.marketInfo);

  const id = readNumber(record, ["id", "attendanceId"]);
  if (id === null) return null;

  const sellerId =
    readNumber(record, ["sellerId"]) ??
    (sellerRecord ? readNumber(sellerRecord, ["id", "sellerId"]) : null);

  const marketId =
    readNumber(record, ["marketId"]) ??
    (marketRecord ? readNumber(marketRecord, ["id", "marketId"]) : null);

  const sellerName =
    readString(record, ["sellerName", "sellerFullName"]) ||
    (sellerRecord
      ? `${readString(sellerRecord, ["firstName", "name"])} ${readString(sellerRecord, ["lastName", "surname"])} `.trim()
      : "") ||
    (sellerId !== null ? `Πωλητής #${sellerId}` : "-");

  const marketName =
    readString(record, ["marketName"]) ||
    (marketRecord ? readString(marketRecord, ["name", "title"]) : "") ||
    (marketId !== null ? `Αγορά #${marketId}` : "-");

  const { recordedByUserId, recordedByName } = resolveRecordedBy(record);

  return {
    id,
    sellerId,
    sellerName,
    marketId,
    marketName,
    recordedByUserId,
    recordedByName,
    attendanceDate: readString(record, ["attendanceDate", "date", "checkInDate"]),
    status: null,
    method: readNumber(record, ["method", "checkInMethod"]),
    notes: readString(record, ["notes"]),
  };
}

export async function getAttendance(params: AttendanceSearchRequest): Promise<AttendanceListResponse> {
  const query = new URLSearchParams();

  if (params.sellerId !== "") query.set("SellerId", String(params.sellerId));
  if (params.marketId !== "") query.set("MarketId", String(params.marketId));
  if (params.dateFrom) query.set("DateFrom", params.dateFrom);
  if (params.dateTo) query.set("DateTo", params.dateTo);
  query.set("Page", String(params.page));
  query.set("PageSize", String(params.pageSize));

  const qs = query.toString();
  const response = await http.get<AttendanceListResponse | AttendanceRecord[] | Record<string, unknown>>(
    `/attendance${qs ? `?${qs}` : ""}`
  );

  if (Array.isArray(response)) {
    const items = response
      .map((entry) => normalizeAttendanceRecord(entry))
      .filter((entry): entry is AttendanceRecord => entry !== null);

    return {
      items,
      totalCount: items.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  const responseRecord = response as Record<string, unknown>;
  const responseItems = Array.isArray(responseRecord.items)
    ? responseRecord.items
    : Array.isArray(responseRecord.data)
      ? responseRecord.data
      : [];

  const items = responseItems
    .map((entry) => normalizeAttendanceRecord(entry))
    .filter((entry): entry is AttendanceRecord => entry !== null);

  return {
    items,
    totalCount: Number(responseRecord.totalCount ?? responseRecord.total ?? items.length),
    page: Number(responseRecord.page ?? params.page),
    pageSize: Number(responseRecord.pageSize ?? params.pageSize),
  };
}