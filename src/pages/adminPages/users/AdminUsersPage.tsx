import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert, Snackbar } from "@mui/material";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { AppUser, UserSearchRequest } from "../../../models/user";
import { useUsersQuery } from "../../../queries/userQueries";
import { USER_ROLE_MAPPING_TITLES } from "../../../shared/mappings/users.mapping";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CustomButton from "../../../shared/components/CustomButton";
import { consumeAuthNotification } from "../../../lib/authNotifications";

const USER_STATUS_CONFIG = {
  active: {
    label: "Ενεργός",
    color: "#166534",
  },
  inactive: {
    label: "Ανενεργός",
    color: "#991b1b",
  },
} as const;

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
    render: (row) => {
      const statusConfig = row.isActive ? USER_STATUS_CONFIG.active : USER_STATUS_CONFIG.inactive;

      return (
        <span
          style={{
            color: statusConfig.color,
            fontWeight: 700,
          }}
        >
          {statusConfig.label}
        </span>
      );
    },
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
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<"success" | "error">("success");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    const nextNotification = consumeAuthNotification();
    if (!nextNotification) return;

    setNotificationMessage(nextNotification.message);
    setNotificationSeverity(nextNotification.type);
    setIsSnackbarOpen(true);
  }, []);

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

  const handleSnackbarClose = (_event?: Event, reason?: string) => {
    if (reason === "clickaway") return;
    setIsSnackbarOpen(false);
  };

  return (
    <div className="flex h-full flex-col gap-6 text-left">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <CustomButton
          title="Νέος χρήστης"
          onClick={() => navigate({ to: "/admin/users/new" })}
          width="fit-content"
        />
      </div>

      <DataTable<AppUser>
        rows={users}
        columns={columns}
        rowKey="id"
        showFilter={false}
        filters={tableFilters}
        initialFilterValues={INITIAL_FILTERS as unknown as FilterValues}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        clearFiltersButtonTitle="Καθαρισμός"
        clearFiltersButtonBackgroundColor="var(--color-text-muted)"
        clearFiltersPrefixIcon={<RestartAltIcon />}
        onRowClick={handleRowClick}
      />

      <Snackbar
        open={isSnackbarOpen && Boolean(notificationMessage)}
        autoHideDuration={4500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={notificationSeverity} variant="filled" sx={{ width: "100%" }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}