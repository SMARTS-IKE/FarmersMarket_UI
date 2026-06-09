import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useMarketSellerQuery } from "../../../queries/sellerQueries";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";

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
        <CustomButton title="Επιστροφή" onClick={handleBack} className="mt-4" />
      </Box>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-5 overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-(--color-text-heading)">Στοιχεία Σύνδεσης Πωλητή στην Αγορά</h2>
          <Typography variant="h5" className="text-(--color-text-heading)">
            {connection.marketName}
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Market Info */}
          <Box className="flex flex-col gap-4 p-4 border rounded-lg bg-white/50">
            <Typography variant="h6" className="font-semibold border-b pb-2 mb-2">
              Πληροφορίες Αγοράς
            </Typography>
            <CustomInputField
              type="TEXT"
              label="Όνομα Αγοράς"
              value={connection.marketName}
              disabled
              width="100%"
            />
            <CustomInputField
                type="TEXT"
                label="Θέση"
                value={connection.spotLocation || "-"}
                disabled
                width="100%"
            />
             <CustomInputField
                type="TEXT"
                label="Μήκος Θέσης (m)"
                value={connection.spotLength?.toString() || "-"}
                disabled
                width="100%"
            />
          </Box>

          {/* Seller Info */}
          <Box className="flex flex-col gap-4 p-4 border rounded-lg bg-white/50">
            <Typography variant="h6" className="font-semibold border-b pb-2 mb-2">
              Πληροφορίες Πωλητή
            </Typography>
            <CustomInputField
              type="TEXT"
              label="Ονοματεπώνυμο"
              value={connection.sellerFullName}
              disabled
              width="100%"
            />
            <CustomInputField
              type="TEXT"
              label="ΑΦΜ"
              value={connection.sellerAfm}
              disabled
              width="100%"
            />
          </Box>

          {/* Connection Period */}
          <Box className="flex flex-col gap-4 p-4 border rounded-lg bg-white/50">
            <Typography variant="h6" className="font-semibold border-b pb-2 mb-2">
              Περίοδος Σύνδεσης
            </Typography>
            <div className="flex gap-4">
              <CustomInputField
                type="DATE"
                label="Από"
                value={connection.fromDate.split('T')[0]}
                disabled
                width="100%"
              />
              <CustomInputField
                type="DATE"
                label="Έως"
                value={connection.toDate ? connection.toDate.split('T')[0] : "-"}
                disabled
                width="100%"
              />
            </div>
            <CustomInputField
              type="TEXT"
              label="Κατάσταση"
              value={connection.isActive ? "Ενεργή" : "Ανενεργή"}
              disabled
              width="100%"
            />
          </Box>

          {/* Additional Info */}
          <Box className="flex flex-col gap-4 p-4 border rounded-lg bg-white/50">
            <Typography variant="h6" className="font-semibold border-b pb-2 mb-2">
              Λοιπά Στοιχεία
            </Typography>
            <CustomInputField
                type="TEXT"
                label="Κατηγορία Άδειας"
                value={connection.licenseCategory.toString()}
                disabled
                width="100%"
            />
            {connection.requestId && (
                <CustomButton 
                    title="Προβολή Αίτησης"
                    onClick={() => navigate({ to: `/admin/requests/${connection.requestId}` })}
                    width="fit-content"
                />
            )}
          </Box>
        </div>

        <Box className="mt-6 p-4 border rounded-lg bg-white/50">
            <Typography variant="h6" className="font-semibold border-b pb-2 mb-2">
              Σημειώσεις
            </Typography>
            <CustomInputField
              type="TEXTAREA"
              label=""
              value={connection.notes || "-"}
              disabled
              width="100%"
            />
        </Box>
      </div>
    </div>
  );
}
