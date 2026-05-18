import { useQuery } from "@tanstack/react-query";
import type { AttendanceListResponse, AttendanceSearchRequest } from "../models/attendance";
import { getAttendance } from "../services/attendanceService";

const ATTENDANCE_STALE_TIME_MS = 60 * 1000;
const ATTENDANCE_GC_TIME_MS = 10 * 60 * 1000;

export const attendanceKeys = {
  all: ["attendance"] as const,
  list: (params: AttendanceSearchRequest) => ["attendance", "list", params] as const,
};

export function useAttendanceQuery(params: AttendanceSearchRequest) {
  return useQuery<AttendanceListResponse, Error>({
    queryKey: attendanceKeys.list(params),
    queryFn: () => getAttendance(params),
    staleTime: ATTENDANCE_STALE_TIME_MS,
    gcTime: ATTENDANCE_GC_TIME_MS,
  });
}