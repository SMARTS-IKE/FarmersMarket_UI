import DataTable from "../../shared/components/DataTable";
import CustomButton from "../../shared/components/CustomButton";
import { useNavigate } from "@tanstack/react-router";
import type { RequestSheet } from "../../models/request";
import { designRequestColumns } from "./request.utils";

const DESIGN_REQUESTS: RequestSheet[] = [];

export default function DesignRequestSheet() {
  const navigate = useNavigate({ from: "/admin/requests" });

  const handleCreateForm = () => {
    navigate({ to: "./design-form" });
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
        rows={DESIGN_REQUESTS}
        columns={designRequestColumns}
        rowKey="id"
        showFilter={false}
      />
    </div>
  );
}
