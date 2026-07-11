import DeleteIcon from "@mui/icons-material/Delete";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import CustomButton from "../../shared/components/CustomButton";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";
import { SELLER_TYPE_LABELS } from "../sellers/sellers.utils";
import { useSellersQuery } from "../../queries/sellerQueries";
import { useMarketSellersQuery } from "../../queries/marketQueries";
import EditMarketSellerModal from "./EditMarketSellerModal";
import { updateMarketSeller } from "../../services/sellerService";
import { queryClient } from "../../lib/queryClient";
import { marketKeys } from "../../queries/marketQueries";

interface ConnectedSellersTableProps {
  sellers?: unknown[];
  marketId?: number;
  onRemoveSeller?: (sellerId: number) => void;
}

const LICENSE_STATUS_CONFIG: Record<string, { label: string; backgroundColor: string; color: string }> = {
  active: {
    label: "Ενεργή",
    backgroundColor: "transparent",
    color: "#166534",
  },
  pending: {
    label: "Σε εκκρεμότητα",
    backgroundColor: "transparent",
    color: "#92400e",
  },
  expired: {
    label: "Έληξε",
    backgroundColor: "transparent",
    color: "#991b1b",
  },
  revoked: {
    label: "Ανακλημένη",
    backgroundColor: "transparent",
    color: "#991b1b",
  },
  inactive: {
    label: "Ανενεργή",
    backgroundColor: "transparent",
    color: "#374151",
  },
  unknown: {
    label: "Άγνωστη",
    backgroundColor: "transparent",
    color: "#374151",
  },
};


function createConnectedSellerColumns(
  onRemoveSeller?: (sellerId: number) => void
): ColumnDef<Record<string, unknown>>[] {

  return [
  {
    key: "spotNumber",
    label: "Αριθμός θέσης",
    filterable: false,
    render: (row) => String(row.spotNumber ?? "—"),
  },
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  {
    key: "sellerType",
    label: "Τύπος Πωλητή",
    filterable: false,
    render: (row) => {
      const type = Number(row.sellerType ?? 0);
      return SELLER_TYPE_LABELS[type] ?? "—";
    },
  },
 
  {
    key: "spotLength",
    label: "Μήκος θέσης (μέτρα)",
    filterable: false,
    render: (row) => String(row.spotLength ?? "—"),
  },
  {
    key: "actions",
    label: "Ενέργειες",
    filterable: false,
    render: (row) => {
      const sellerId = Number(row.sellerId ?? row.id);

      return (
        <CustomButton
          title="Διαγραφή"
          prefixIcon={<DeleteIcon />}
          backgroundColor="var(--color-danger)"
          width="fit-content"
          disabled={!Number.isFinite(sellerId) || !onRemoveSeller}
          onClick={(e) => {
            e.stopPropagation();
            if (Number.isFinite(sellerId)) {
              onRemoveSeller?.(sellerId);
            }
          }}
        />
      );
    },
  },
];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function resolveSellerRecord(record: Record<string, unknown>): Record<string, unknown> {
  return (
    asRecord(record.seller) ??
    asRecord(record.sellerInfo) ??
    asRecord(record.sellerDetails) ??
    asRecord(record.user) ??
    record
  );
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readBoolean(record: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function extractSellerId(entry: unknown): number | null {
  const record = asRecord(entry);
  if (!record) return null;

  const sellerRecord = resolveSellerRecord(record);
  return readNumber(record, ["sellerId", "id"]) ?? readNumber(sellerRecord, ["sellerId", "id"]);
}

function normalizeLicenseStatus(
  marketSellerRecord: Record<string, unknown>,
  sellerRecord: Record<string, unknown>
): { key: string; label: string } {
  const rawStatus = readString(marketSellerRecord, ["licenseStatus", "permitStatus", "permitState", "status"]) ||
    readString(sellerRecord, ["licenseStatus", "permitStatus", "permitState"]);

  if (rawStatus) {
    const normalized = rawStatus.trim().toLowerCase();
    if (normalized.includes("active") || normalized === "ενεργή" || normalized === "ενεργος") {
      return { key: "active", label: LICENSE_STATUS_CONFIG.active.label };
    }
    if (normalized.includes("pending") || normalized.includes("εκκρε")) {
      return { key: "pending", label: LICENSE_STATUS_CONFIG.pending.label };
    }
    if (normalized.includes("expired") || normalized.includes("ληξ")) {
      return { key: "expired", label: LICENSE_STATUS_CONFIG.expired.label };
    }
    if (normalized.includes("revoked") || normalized.includes("ανακλ")) {
      return { key: "revoked", label: LICENSE_STATUS_CONFIG.revoked.label };
    }
    if (normalized.includes("inactive") || normalized.includes("ανενεργ")) {
      return { key: "inactive", label: LICENSE_STATUS_CONFIG.inactive.label };
    }
  }

  const licenseIsActive = readBoolean(marketSellerRecord, ["isLicenseActive", "licenseIsActive"]);
  if (licenseIsActive !== null) {
    return licenseIsActive
      ? { key: "active", label: LICENSE_STATUS_CONFIG.active.label }
      : { key: "inactive", label: LICENSE_STATUS_CONFIG.inactive.label };
  }

  return { key: "unknown", label: LICENSE_STATUS_CONFIG.unknown.label };
}

function normalizeConnectedSeller(
  entry: unknown,
  sellerDetailsById: Map<number, Record<string, unknown>>
): Record<string, unknown> | null {
  const record = asRecord(entry);
  if (!record) return null;

  const sellerRecord = resolveSellerRecord(record);
  const sellerId = readNumber(record, ["sellerId"]) ?? readNumber(sellerRecord, ["sellerId", "id"]);
  const sellerDetails = sellerId !== null ? sellerDetailsById.get(sellerId) ?? null : null;

  const id =
    readNumber(record, ["id"]) ??
    readNumber(record, ["sellerId"]) ??
    readNumber(sellerRecord, ["id"]) ??
    readNumber(sellerRecord, ["sellerId"]);
  if (id === null) return null;

  let firstName =
    (sellerDetails ? readString(sellerDetails, ["firstName", "name"]) : "") ||
    readString(sellerRecord, ["firstName", "name"]) ||
    readString(record, ["firstName", "name"]);
  let lastName =
    (sellerDetails ? readString(sellerDetails, ["lastName", "surname"]) : "") ||
    readString(sellerRecord, ["lastName", "surname"]) ||
    readString(record, ["lastName", "surname"]);

  if (!firstName && !lastName) {
    const fullName =
      readString(sellerRecord, ["fullName", "displayName"]) ||
      readString(record, ["fullName", "displayName"]);
    if (fullName) {
      const [first, ...rest] = fullName.split(/\s+/);
      firstName = first ?? "";
      lastName = rest.join(" ");
    }
  }

  const sellerType =
    (sellerDetails ? readNumber(sellerDetails, ["sellerType", "type"]) : null) ??
    readNumber(sellerRecord, ["sellerType", "type"]) ??
    readNumber(record, ["sellerType", "type"]) ??
    0;

  const spotNumber =
    readNumber(record, ["spotNumber", "positionNumber", "stallNumber", "marketSpotNumber"]) ??
    (readString(record, ["spotNumber", "positionNumber", "stallNumber", "marketSpotNumber"]) || "—");

  const spotLength =
    readNumber(record, ["spotLength", "stallLength", "marketSpotLength"]) ??
    (readString(record, ["spotLength", "stallLength", "marketSpotLength"]) || "—");

  const sellerIsActive =
    (sellerDetails ? readBoolean(sellerDetails, ["isActive", "active"]) : null) ??
    readBoolean(sellerRecord, ["isActive", "active"]) ??
    readBoolean(record, ["isActive", "active"]) ??
    false;

  const licenseStatus = normalizeLicenseStatus(record, sellerRecord);

  // Merge market-seller assignment data with seller profile data into one row object.
  const connectedSeller = {
    id,
    sellerId: sellerId ?? id,
    firstName,
    lastName,
    sellerType,
    spotNumber,
    spotLength,
    licenseStatus: licenseStatus.label,
    licenseStatusKey: licenseStatus.key,

    // Preserve any assignment metadata so edit modal can read and show it
    fromDate: readString(record, ['fromDate', 'from', 'startDate', 'assignedAt']) || "",
    notes: readString(record, ['notes', 'note']) || "",

    isActive: sellerIsActive,
  };

  return connectedSeller;
}

export default function ConnectedSellersTable({ sellers, marketId, onRemoveSeller }: ConnectedSellersTableProps) {
  const navigate = useNavigate();
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: marketSellersData } = useMarketSellersQuery(marketId ? String(marketId) : "");

  const sellerIds = useMemo(
    () => {
      const source = marketSellersData?.items ?? sellers ?? [];
      return (source as unknown[])
        .map(extractSellerId)
        .filter((id): id is number => id !== null);
    },
    [sellers, marketSellersData?.items]
  );

  const { data: allSellersData } = useSellersQuery({
    name: "",
    afm: "",
    sellerType: "",
    page: 1,
    pageSize: 5000,
  });


  const sellerDetailsById = useMemo(() => {
    const byId = new Map<number, Record<string, unknown>>();
    const idSet = new Set(sellerIds);

    for (const seller of allSellersData?.items ?? []) {
      if (idSet.has(seller.id)) {
        byId.set(seller.id, seller as unknown as Record<string, unknown>);
      }
    }

    return byId;
  }, [allSellersData?.items, sellerIds]);

  const connectedSellers = useMemo(
    () => {
      const source = marketSellersData?.items ?? sellers ?? [];
      return (source as unknown[])
        .map((entry) => normalizeConnectedSeller(entry, sellerDetailsById))
        .filter((seller): seller is Record<string, unknown> => seller !== null);
    },
    [sellers, sellerDetailsById, marketSellersData?.items]
  );

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingRow(null);
    setIsEditOpen(false);
  };

  const handleSaveEdit = async (payload: { spotNumber?: number; spotLength?: number; fromDate?: string; notes?: string }) => {
    if (!editingRow) return;
    const connectionId = Number(editingRow.id ?? editingRow.sellerId ?? editingRow.sellerId);
    if (!Number.isFinite(connectionId)) return;

    try {
      await updateMarketSeller(String(connectionId), {
        spotNumber: payload.spotNumber,
        spotLength: payload.spotLength,
        fromDate: payload.fromDate,
        notes: payload.notes,
      } as any);

      // invalidate market sellers for this market if marketId is available
      if (marketId) {
        void queryClient.invalidateQueries({ queryKey: marketKeys.sellers(String(marketId)) });
      }
    } catch (err) {
      // swallow — caller can inspect network / UI for errors
      console.error('Failed to update market-seller', err);
    } finally {
      closeEdit();
    }
  };


  const columns = useMemo(() => createConnectedSellerColumns(onRemoveSeller), [onRemoveSeller]);

  return (
    <>
      <DataTable<Record<string, unknown>>
        rows={connectedSellers}
        columns={columns}
        rowKey="id"
        showFilter={false}
        defaultRowsPerPage={10}
        onRowClick={(row) => {
          // Open edit modal for the connected seller row
          openEdit(row as Record<string, unknown>);
        }}
      />

      <EditMarketSellerModal
        open={isEditOpen}
        onClose={closeEdit}
        initial={editingRow ? {
          spotNumber: editingRow.spotNumber as any,
          spotLength: editingRow.spotLength as any,
          fromDate: (editingRow as any).fromDate ?? "",
          notes: (editingRow as any).notes ?? "",
          sellerFullName: `${(editingRow as any).firstName ?? ""} ${(editingRow as any).lastName ?? ""}`.trim(),
          sellerId: (editingRow as any).sellerId ?? (editingRow as any).id,
          firstName: (editingRow as any).firstName ?? undefined,
          lastName: (editingRow as any).lastName ?? undefined,
        } : undefined}
        onSave={handleSaveEdit}
      />
    </>
  );
}

// Render edit modal at end of file so component-level imports stay grouped

export function ConnectedSellersTableWithModal(props: ConnectedSellersTableProps) {
  // Reuse ConnectedSellersTable component logic by rendering it and the modal together.
  return (
    <>
      <ConnectedSellersTable {...props} />
    </>
  );
}
