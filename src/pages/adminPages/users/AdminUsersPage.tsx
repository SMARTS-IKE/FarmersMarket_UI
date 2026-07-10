import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert, Snackbar } from "@mui/material";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { AppUser, UserSearchRequest } from "../../../models/user";
import { useUsersQuery } from "../../../queries/userQueries";
import { USER_ROLE_MAPPING_TITLES } from "../../../shared/mappings/users.mapping";
import { useGlobalEnums } from '../../../shared/mappings/GlobalEnums';
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CustomButton from "../../../shared/components/CustomButton";
import { consumeAuthNotification } from "../../../lib/authNotifications";

// Colors for status display (kept for visual distinction)
const USER_STATUS_COLORS = {
  active: '#166534',
  inactive: '#991b1b',
};

const userRoleValues = Object.entries(USER_ROLE_MAPPING_TITLES).map(([key, value]) => ({
  label: value,
  value: key,
}));




const tableFilters: FilterDef[] = [
  { title: "email", label: "Email", type: "TEXT" },
  {
    title: "role",
    label: "Ρόλος",
    type: "DROPDOWN",
    dataItems: userRoleValues,
  },
];

const INITIAL_FILTERS: UserSearchRequest = {
  email: "",
  role: "Admin_Access",
  status: "",
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

  const { UserStatusLabels, UserStatus } = useGlobalEnums();

  const columns: ColumnDef<AppUser>[] = [
    { key: "firstName", label: "Όνομα" },
    { key: "lastName", label: "Επώνυμο" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Κατάσταση",
      render: (row) => {
        // Prefer numeric `status` from backend; fall back to boolean `isActive` for older payloads
        const rawStatus = (row as any).status;
        // Treat `0` as active (green) and `1` as inactive (red).
        const statusValue = typeof rawStatus === 'number' ? rawStatus : (row.isActive ? 0 : 1);
        const label = UserStatusLabels[statusValue] ?? (statusValue === 0 ? 'Ενεργός' : 'Ανενεργός');
        const color = statusValue === 0 ? USER_STATUS_COLORS.active : USER_STATUS_COLORS.inactive;
        return <span style={{ color, fontWeight: 700 }}>{label}</span>;
      },
    },
    {
      key: "roles",
      label: "Ρόλοι",
      render: (row) => row.roles?.join(", ") ?? "—",
    },
  ];

  const userStatusValues = Object.keys(UserStatus)
    .filter((k) => isNaN(Number(k)))
    .map((name) => {
      const val = (UserStatus as any)[name] as number;
      const label = UserStatusLabels?.[val] ?? name;
      return { label, value: String(val) };
    });

  const tableFilters: FilterDef[] = [
    { title: "email", label: "Email", type: "TEXT" },
    {
      title: "role",
      label: "Ρόλος",
      type: "DROPDOWN",
      dataItems: userRoleValues,
    },
    {
      title: "status",
      label: "Κατάσταση",
      type: "DROPDOWN",
      dataItems: userStatusValues,
    },
  ];

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      email: String(values["email"] ?? ""),
      role: String(values["role"] ?? ""),
      status: values["status"] === undefined ? prev.status : (values["status"] ?? ""),
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