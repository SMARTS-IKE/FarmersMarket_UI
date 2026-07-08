import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import AttendanceTable from "../../../components/markets/AttendanceTable";

interface Props {
  marketId: number;
}

export default function AdminMarketSellerParticipations({ marketId }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Συμμετοχές Πωλητών</Typography>
      <AttendanceTable marketId={marketId} />
    </div>
  );
}
