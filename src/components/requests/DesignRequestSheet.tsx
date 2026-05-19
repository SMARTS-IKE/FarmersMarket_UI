import { useMemo } from "react";
import DataTable from "../../shared/components/DataTable";
import { useNavigate } from "@tanstack/react-router";
import type { RequestSheet } from "../../models/request";
import { useRequestFormsQuery } from "../../queries/formsQueries";
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
