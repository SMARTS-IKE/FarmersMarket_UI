export type AttendanceStatus = 1 | 2 | 3;

export interface AttendanceSearchRequest {
  sellerId: number | "";
  marketId: number | "";
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
}

export interface AttendanceRecord {
  id: number;
  sellerId: number | null;
  sellerName: string;
  marketId: number | null;
  marketName: string;
  recordedByUserId: number | string | null;
  recordedByName: string;
  attendanceDate: string;
  status: AttendanceStatus | null;
  method: number | null;
  notes: string;
}

export interface AttendanceListResponse {
  items: AttendanceRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
}