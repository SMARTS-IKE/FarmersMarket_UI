import { useState } from "react";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { AppUser, UserListResponse, UserSearchRequest } from "../../../models/user";
import { useUsersQuery } from "../../../queries/userQueries";

const columns: ColumnDef<AppUser>[] = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "email", label: "Email" },
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
  const [filters, setFilters] = useState<UserSearchRequest>({
    name: "",
    email: "",
    role: "",
    page: 1,
    pageSize: 25,
  });

  const { data } = useUsersQuery(filters);
  const responseData: UserListResponse = { items: data ? data as unknown as AppUser[] : [], totalCount: 0, page: 1, pageSize: 25 };
  const users = responseData.items ?? [];

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      email: String(values["email"] ?? ""),
      role: String(values["role"] ?? ""),
      page: 1,
    }));
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
      />
    </div>
  );
}