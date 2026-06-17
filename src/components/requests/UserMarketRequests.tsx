import { useMemo } from "react";
import DataTable from "../../shared/components/DataTable";
import type { RequestSheet } from "../../models/request";
import { useRequestFormsQuery } from "../../queries/formsQueries";
import { designRequestColumns } from "./request.utils";

export default function UserMarketRequests() {
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

  return (
    <div className="flex w-full flex-col gap-4">
      <DataTable<RequestSheet>
        rows={rows}
        columns={designRequestColumns}
        rowKey="id"
        showFilter={false}
      />
    </div>
  );
}
