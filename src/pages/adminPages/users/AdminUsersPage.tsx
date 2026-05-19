import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { AppUser, UserSearchRequest } from "../../../models/user";
import { useUsersQuery } from "../../../queries/userQueries";
import { USER_ROLE_MAPPING_TITLES } from "../../../shared/mappings/users.mapping";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const userRoleValues = Object.entries(USER_ROLE_MAPPING_TITLES).map(([key, value]) => ({
  label: value,
  value: key,
}));


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
    dataItems: userRoleValues,
  },
];

const INITIAL_FILTERS: UserSearchRequest = {
  name: "",
  email: "",
  role: "",
  page: 1,
  pageSize: 25,
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserSearchRequest>(INITIAL_FILTERS);

  const { data } = useUsersQuery(filters);
  const rawUsers = Array.isArray(data)
    ? data
    : data?.items ?? [];

  const users = rawUsers.map((user) => ({
    ...user,
    roles: (user.roles ?? []).map((roleKey) => {
      const mappedRole = USER_ROLE_MAPPING_TITLES[roleKey as keyof typeof USER_ROLE_MAPPING_TITLES];
      return mappedRole ?? roleKey;
    }),
  }));

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      email: String(values["email"] ?? ""),
      role: String(values["role"] ?? ""),
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
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
        initialFilterValues={INITIAL_FILTERS}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        clearFiltersButtonTitle="Καθαρισμός"
        clearFiltersButtonBackgroundColor="var(--color-text-muted)"
        clearFiltersPrefixIcon={<RestartAltIcon />}
        onRowClick={handleRowClick}
      />
    </div>
  );
}