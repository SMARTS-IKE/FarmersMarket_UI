import { Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { designRequestColumns } from "../../components/requests/request.utils";
import type { RequestSheet } from "../../models/request";
import { useRequestFormsQuery } from "../../queries/formsQueries";
import CustomButton from "../../shared/components/CustomButton";
import DataTable from "../../shared/components/DataTable";

export default function UserRequestCreationPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useRequestFormsQuery();

  const rows = useMemo<RequestSheet[]>(
    () =>
      (data?.items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
      })),
    [data]
  );

  const handleBack = () => {
    navigate({ to: "/users/requests" });
  };

  const handleRowClick = (row: RequestSheet) => {
    navigate({
      to: "/users/requests/forms/$formId",
      params: { formId: String(row.id) },
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 text-left overflow-hidden">
      <div className="flex justify-end">
        <CustomButton
          title="Επιστροφή"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
        />
      </div>

      {isError && (
        <Alert severity="error">
          {error?.message ?? "Δεν ήταν δυνατή η φόρτωση των διαθέσιμων φορμών αίτησης."}
        </Alert>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-(--color-text-muted)">
          Φόρτωση διαθέσιμων φορμών αίτησης...
        </div>
      )}

      {!isLoading && (
        <DataTable<RequestSheet>
          rows={rows}
          columns={designRequestColumns}
          rowKey="id"
          showFilter={false}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
