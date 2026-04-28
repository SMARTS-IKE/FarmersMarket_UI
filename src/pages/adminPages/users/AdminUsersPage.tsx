import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { AppUser, UserSearchRequest } from "../../../models/user";
import { useUsersQuery } from "../../../queries/userQueries";

const columns: ColumnDef<AppUser>[] = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "email", label: "Email" },
  {
    key: "isActive",
    label: "Κατάσταση",
    render: (row) => (row.isActive ? "Ενεργός" : "Ανενεργός"),
  },
  {
    key: "roles",
    label: "Ρόλοι",
    render: (row) => row.roles?.join(", ") ?? "—",
  },
];

const tableFilters: FilterDef[] = [
  { title: "name", label: "Όνομα", type: "TEXT" },
  { title: "email", label: "Email", type: "TEXT" },
  {
    title: "role",
    label: "Ρόλος",
    type: "DROPDOWN",
    dataItems: [
      { label: "Admin", value: "Admin" },
      { label: "Seller", value: "Seller" },
      { label: "Customer", value: "Customer" },
    ],
  },
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserSearchRequest>({
    name: "",
    email: "",
    role: "",
    page: 1,
    pageSize: 25,
  });

  const { data } = useUsersQuery(filters);
  const users = Array.isArray(data) ? data : data?.items ?? [];

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      email: String(values["email"] ?? ""),
      role: String(values["role"] ?? ""),
      page: 1,
    }));
  };

  const handleRowClick = (user: AppUser) => {
    navigate({
      to: "/admin/users/$id",
      params: { id: user.id },
    });
  };

  return (
    <div className="flex h-full flex-col gap-6 text-left">
  

      <DataTable<AppUser>
        rows={users}
        columns={columns}
        rowKey="id"
        showFilter={false}
        filters={tableFilters}
        onSearch={handleSearch}
        onRowClick={handleRowClick}
      />
    </div>
  );
}