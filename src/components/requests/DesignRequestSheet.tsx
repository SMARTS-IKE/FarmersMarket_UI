import { useMemo } from "react";
import DataTable from "../../shared/components/DataTable";
import CustomButton from "../../shared/components/CustomButton";
import { useNavigate } from "@tanstack/react-router";
import type { RequestSheet } from "../../models/request";
import { useRequestFormsQuery } from "../../queries/requestQueries";
import { designRequestColumns } from "./request.utils";

export default function DesignRequestSheet() {
  const navigate = useNavigate({ from: "/admin/requests" });
  const { data } = useRequestFormsQuery();

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

  const handleCreateForm = () => {
    navigate({ to: "./design-form" });
  };

  const handleRowClick = (row: RequestSheet) => {
    if (!row.id) return;
    navigate({ to: `/admin/requests/design-form/${row.id}` });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full justify-end">
        <CustomButton
          title="Δημιουργία Φόρμας Αίτησης"
          width="fit-content"
          onClick={handleCreateForm}
        />
      </div>

      <DataTable<RequestSheet>
        rows={rows}
        columns={designRequestColumns}
        rowKey="id"
        showFilter={false}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
