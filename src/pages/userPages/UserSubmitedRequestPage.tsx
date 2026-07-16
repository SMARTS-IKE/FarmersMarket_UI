import "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { CircularProgress, Alert } from "@mui/material";
import CustomButton from "../../shared/components/CustomButton";
import { useSubmittedRequestDetailQuery } from "../../queries/requestQueries";
import SubmittedRequestForm from "../../components/requests/SubmittedRequestForm";

export default function UserSubmitedRequestPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: request, isLoading, error } = useSubmittedRequestDetailQuery(id as string);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="m-4">
        <Alert severity="error">Σφάλμα κατά την ανάκτηση των στοιχείων της αίτησης: {error?.message || "Η αίτηση δεν βρέθηκε."}</Alert>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-(--color-text-heading)">Στοιχεία Αίτησης #{request.id}</h2>
          </div>
          <div className="flex-shrink-0">
            <CustomButton
              title="Επιστροφή"
              onClick={() => navigate({ to: "/users/requests" } as any)}
              backgroundColor="var(--color-text-muted)"
              width={180}
            />
          </div>
        </div>

        <SubmittedRequestForm request={request} />
      </div>
    </div>
  );
}
