import { Alert, Box, CircularProgress, Typography, Tooltip } from "@mui/material";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMarketSellerQuery, useUpdateMarketSellerMutation } from "../../../queries/sellerQueries";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import LaunchIcon from "@mui/icons-material/Launch";

export default function AdminSellerMarketPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const marketConnectionId = typeof params.marketConnectionId === "string" ? params.marketConnectionId : "";
  const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
  const { data: connection, isLoading, isError, error } = useMarketSellerQuery(marketConnectionId);
  const updateMutation = useUpdateMarketSellerMutation(marketConnectionId);

  const [isEditing, setIsEditing] = useState(true);
  const [spotLocation, setSpotLocation] = useState<string | null>(null);
  const [spotLength, setSpotLength] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!connection) return;
    setSpotLocation(connection.spotLocation ?? null);
    setSpotLength(connection.spotLength ?? null);
    setFromDate(connection.fromDate ? connection.fromDate.split("T")[0] : "");
    setNotes(connection.notes ?? "");
  }, [connection]);

  const hasChanges = (() => {
    if (!connection) return false;
    const origSpot = connection.spotLocation ?? null;
    const origLength = connection.spotLength ?? null;
    const origFrom = connection.fromDate ? connection.fromDate.split("T")[0] : "";
    const origNotes = connection.notes ?? "";

    // Strict comparison is fine for these primitives
    if ((spotLocation ?? null) !== origSpot) return true;
    if ((spotLength ?? null) !== origLength) return true;
    if ((fromDate ?? "") !== origFrom) return true;
    if ((notes ?? "") !== origNotes) return true;
    return false;
  })();
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

      <div className="flex-1 overflow-y-auto">
        <Box className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Typography variant="h6" className="font-bold pb-2 mb-2">
              Στοιχεία Θέσης: 
              <p className="text-(--color-text)">
                {connection.marketName}
                <Tooltip title="Μετάβαση στη συγκεκριμένη αγορά">
                  <Link
                    to="/admin/markets/$marketId"
                    params={{ marketId: String(connection.marketId) }}
                    className="text-(--color-text-muted) hover:underline font-medium"
                  >
                    <LaunchIcon fontSize="small" className="ml-1" />
                  </Link>
                </Tooltip>
              </p>
            </Typography>
            {/* action buttons moved to bottom-right */}
          </div>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomInputField
              type="TEXT"
              label="Αριθμός θέσης"
              value={spotLocation ?? ""}
              disabled={!isEditing}
              width="100%"
              onChange={(v) => setSpotLocation(String(v) || null)}
            />
            <CustomInputField
              type="NUMBER"
              label="Μήκος θέσης"
              value={spotLength !== null && spotLength !== undefined ? String(spotLength) : ""}
              disabled={!isEditing}
              width="100%"
              onChange={(v) => setSpotLength(v === "" ? null : Number(v))}
            />
             <CustomInputField
              type="DATE"
              label="Ημερομηνία Έναρξης"
              value={fromDate}
              disabled={!isEditing}
              width="100%"
              onChange={(v) => setFromDate(String(v))}
            />
          </Box>
          <Box className="mt-4">
            <CustomInputField
              type="TEXTAREA"
              label="Σημειώσεις"
              value={notes}
              disabled={!isEditing}
              width="100%"
              bottomOnly={true}
              onChange={(v) => setNotes(String(v))}
              sx={{
                "& .MuiInputBase-root": { border: 'none', backgroundColor: 'transparent' },
                "& textarea, & .MuiOutlinedInput-input, & .MuiInputBase-input": {
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                },
              }}
            />
          </Box>

          <Box className="mt-4 flex justify-end">
            {hasChanges && (
              <>
                <CustomButton
                  title={updateMutation.isLoading ? "Αποθήκευση..." : "Αποθήκευση"}
                  onClick={async () => {
                    try {
                      await updateMutation.mutateAsync({
                        spotLocation: spotLocation,
                        spotLength: spotLength,
                        fromDate: fromDate,
                        notes: notes,
                      });
                    } catch (e) {
                      // mutation error handled elsewhere
                    }
                  }}
                />
                <CustomButton
                  title="Ακύρωση"
                  backgroundColor="var(--color-text-muted)"
                  onClick={() => {
                    if (connection) {
                      setSpotLocation(connection.spotLocation ?? null);
                      setSpotLength(connection.spotLength ?? null);
                      setFromDate(connection.fromDate ? connection.fromDate.split("T")[0] : "");
                      setNotes(connection.notes ?? "");
                    }
                  }}
                  sx={{ ml: 2 }}
                />
              </>
            )}
          </Box>
        </Box>
      </div>
    </div>
  );
}
