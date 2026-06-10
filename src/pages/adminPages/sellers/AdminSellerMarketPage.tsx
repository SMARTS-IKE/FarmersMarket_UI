import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMarketSellerQuery } from "../../../queries/sellerQueries";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import LaunchIcon from "@mui/icons-material/Launch";

export default function AdminSellerMarketPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const marketConnectionId = typeof params.marketConnectionId === "string" ? params.marketConnectionId : "";
  const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";

  const { data: connection, isLoading, isError, error } = useMarketSellerQuery(marketConnectionId);

  const handleBack = () => {
    navigate({ to: `/admin/sellers/${sellerId}` });
  };

  if (isLoading) {
    return (
      <Box className="flex h-full items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !connection) {
    return (
      <Box className="p-4">
        <Alert severity="error">
          Σφάλμα κατά τη φόρτωση των στοιχείων της σύνδεσης: {error?.message || "Η σύνδεση δεν βρέθηκε"}
        </Alert>
        <CustomButton title="Επιστροφή" onClick={handleBack} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-5 overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-(--color-text-heading)">Πωλητής</h2>
          <Typography variant="h6" className="text-(--color-text-heading)">
            {connection.sellerFullName}
          </Typography>
        </div>
        <CustomButton
          title="Επιστροφή στον πωλητή"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <Box className="flex flex-col gap-4 p-4 border rounded-lg bg-white/50">
          <Typography variant="h6" className="font-bold border-b pb-2 mb-2">
            Στοιχεία Θέσης στην Αγορά: 
             <span className="text-(--color-text) font-medium pl-1">
              {connection.marketName}
             </span>
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomInputField
              type="TEXT"
              label="Αριθμός θέσης"
              value={connection.spotLocation || "-"}
              disabled
              width="100%"
            />
            <CustomInputField
              type="TEXT"
              label="Μήκος θέσης"
              value={connection.spotLength?.toString() || "-"}
              disabled
              width="100%"
            />
             <CustomInputField
              type="TEXT"
                label="Ημερομηνία Έναρξης"
              value={connection.fromDate.split("T")[0]}
              disabled
              width="100%"
            />
          </Box>
        </Box>

        <Box className="mt-6">
          <Link
            to="/admin/markets/$marketId"
            params={{ marketId: String(connection.marketId) }}
            className="text-(--color-text-muted) hover:underline font-medium"
          >
            Μετάβαση στη συγκεκριμένη αγορά <LaunchIcon fontSize="small" className="ml-1" />
          </Link>
        </Box>
      </div>
    </div>
  );
}
