import { useParams } from "@tanstack/react-router";
import { Box, Card, CardContent, Divider, Grid, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import { useSubmittedRequestDetailQuery } from "../../../queries/requestQueries";
import type { RequestStatus } from "../../../models/request";

const statusLabels: Record<RequestStatus, { label: string; color: "warning" | "success" | "error" }> = {
  0: { label: "Σε Αναμονή", color: "warning" },
  1: { label: "Εγκεκριμένο", color: "success" },
  2: { label: "Απορριφθέν", color: "error" },
};

export default function SubmittedRequestDetailedPage() {
  const { id } = useParams({ strict: false });
  const { data: request, isLoading, error } = useSubmittedRequestDetailQuery(id as string);

  if (isLoading) {
    return (
      <Box className="flex h-full w-full items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box className="m-4">
        <Alert severity="error">
          Σφάλμα κατά την ανάκτηση των στοιχείων της αίτησης: {error?.message || "Η αίτηση δεν βρέθηκε."}
        </Alert>
      </Box>
    );
  }

  const statusInfo = statusLabels[request.status];

  return (
    <Box className="flex w-full flex-col gap-6 p-6">
      <Box className="flex items-center justify-between">
        <Typography variant="h5" className="font-bold">
          Στοιχεία Αίτησης #{request.id}
        </Typography>
        <Chip label={statusInfo.label} color={statusInfo.color} sx={{ fontWeight: 'bold' }} />
      </Box>

      <Grid container spacing={4}>
        {/* Seller Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Στοιχεία Πωλητή
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box className="flex flex-col gap-2">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Ονοματεπώνυμο</Typography>
                  <Typography variant="body1">{request.sellerFullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">ΑΦΜ</Typography>
                  <Typography variant="body1">{request.sellerAfm}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Ημερομηνία Υποβολής</Typography>
                  <Typography variant="body1">
                    {new Date(request.submittedAt).toLocaleString("el-GR")}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Markets Info */}
        <Grid item xs={12} md={6}>
          <Card h-full>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Επιλεγμένες Αγορές
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box className="flex flex-wrap gap-2">
                {request.markets.map((m) => (
                  <Chip key={m.marketId} label={m.marketName} variant="outlined" />
                ))}
                {request.markets.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Δεν έχουν επιλεγεί αγορές.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dynamic Fields */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Συμπληρωμένα Πεδία
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {request.fieldValues.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field.id}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {field.fieldLabel}
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {field.value || "-"}
                      </Typography>
                      {field.reviewComment && (
                        <Typography variant="caption" color="error">
                          Σχόλιο: {field.reviewComment}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
                {request.fieldValues.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Δεν υπάρχουν επιπλέον πεδία στην αίτηση.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Execution/Process Notes */}
        {(request.processedAt || request.notes || request.rejectionReason) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Σημειώσεις Επεξεργασίας
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  {request.processedAt && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Ημερομηνία Επεξεργασίας</Typography>
                      <Typography variant="body1">
                        {new Date(request.processedAt).toLocaleString("el-GR")}
                      </Typography>
                    </Grid>
                  )}
                  {request.notes && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Σημειώσεις</Typography>
                      <Typography variant="body1">{request.notes}</Typography>
                    </Grid>
                  )}
                  {request.rejectionReason && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Λόγος Απόρριψης</Typography>
                      <Typography variant="body1" color="error">{request.rejectionReason}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
