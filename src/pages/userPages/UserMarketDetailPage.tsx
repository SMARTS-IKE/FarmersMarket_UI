import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import CustomButton from "../../shared/components/CustomButton";
import MarketForm from "../../components/markets/MarketForm";
import type { Market, MarketFormValues } from "../../models/market";
import { useMarketQuery, useMarketSellersQuery } from "../../queries/marketQueries";
import ConnectedSellersTable from "../../components/markets/ConnectedSellersTable";
import AttendanceTable from "../../components/markets/AttendanceTable";
// utilities intentionally not required in view-only page

const EMPTY_FORM_VALUES: MarketFormValues = {
  name: "",
  marketType: 1,
  address: "",
  operatingDays: [],
  availableSlots: 0,
  occupiedSpots: 0,
  supervisors: [],
  area: "",
  latitude: null,
  longitude: null,
  radius: null,
  areaPoints: [],
};

const DAY_NUMBER_TO_NAME: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
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

function resolveOccupiedSpots(market: Market): number {
  const marketRecord = asRecord(market);
  if (marketRecord) {
    const explicitOccupiedSpots = (marketRecord as any).occupiedSpots ?? (marketRecord as any).occupied_slots ?? null;
    if (typeof explicitOccupiedSpots === "number") return explicitOccupiedSpots;
  }

  return Array.isArray(market.marketSellers) ? market.marketSellers.length : 0;
}

function mapMarketToFormValues(market: Market): MarketFormValues {
  const marketRecord = asRecord(market);
  const marketLocations = Array.isArray(market.locations)
    ? market.locations.filter(
        (location): location is { latitude: number; longitude: number } =>
          typeof location?.latitude === "number" &&
          Number.isFinite(location.latitude) &&
          typeof location?.longitude === "number" &&
          Number.isFinite(location.longitude)
      )
    : [];
  const fallbackLatitude = marketLocations[0]?.latitude ?? null;
  const fallbackLongitude = marketLocations[0]?.longitude ?? null;

  const supervisors = (Array.isArray(market.supervisors) ? market.supervisors : [])
    .map((supervisor) => ((supervisor as any).userId ?? (supervisor as any).aspNetUserId ?? String((supervisor as any).id ?? '')))
    .filter((userId): userId is string => Boolean(userId));

  const operatingDays = (Array.isArray(market.schedules) ? market.schedules : [])
    .filter((schedule) => !schedule.isCancelled)
    .map((schedule) => ({
      day: DAY_NUMBER_TO_NAME[schedule.day] ?? "",
      openTime: (market.currentHistory?.openTime ?? market.openTime ?? "").slice(0, 5),
      closeTime: (market.currentHistory?.closeTime ?? market.closeTime ?? "").slice(0, 5),
    }))
    .filter((entry) => entry.day);

  const availableSlots = market.currentHistory?.capacity ?? market.totalSpots ?? 0;
  const occupiedSpots = resolveOccupiedSpots(market);

  return {
    name: market.name,
    marketType: market.marketType === 2 ? 2 : 1,
    address: market.address,
    operatingDays,
    availableSlots,
    occupiedSpots,
    supervisors,
    area: (marketRecord ? readString(marketRecord, ["area", "region", "district"]) : "") || "",
    latitude: typeof market.latitude === "number" && Number.isFinite(market.latitude) ? market.latitude : fallbackLatitude,
    longitude: typeof market.longitude === "number" && Number.isFinite(market.longitude) ? market.longitude : fallbackLongitude,
    radius: null,
    areaPoints: marketLocations.map((location, idx) => ({ id: `location-${idx + 1}`, lat: location.latitude, lng: location.longitude })),
  };
}

export default function UserMarketDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const marketId = typeof params.marketId === "string" ? params.marketId : "";
  const { data: market, isLoading, isError, error } = useMarketQuery(marketId);
  const { data: marketSellersData } = useMarketSellersQuery(marketId);

  const [activeTab, setActiveTab] = useState(0);
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const [initialFormValues, setInitialFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const [connectedSellers, setConnectedSellers] = useState<unknown[]>([]);

  useEffect(() => {
    if (!market) return;
    const mappedValues = mapMarketToFormValues(market);
    setFormValues(mappedValues);
    setInitialFormValues(mappedValues);
  }, [market]);

  useEffect(() => {
    if (marketSellersData) {
      setConnectedSellers(marketSellersData.items ?? []);
    } else if (market) {
      setConnectedSellers(market.marketSellers ?? []);
    }
  }, [marketSellersData, market]);

  const connectedSellersCount = connectedSellers.length;

  const handleBackToList = () => navigate({ to: "/users/markets" });

  // no-op

  if (!marketId) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία αγοράς</h1>
        <p className="text-sm text-(--color-text-muted)">Δεν βρέθηκε έγκυρο αναγνωριστικό αγοράς.</p>
        <CustomButton title="Επιστροφή στη λίστα αγορών" backgroundColor="var(--color-text-muted)" width="fit-content" onClick={handleBackToList} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία αγοράς</h1>
        <p className="text-sm text-(--color-text-muted)">Φόρτωση στοιχείων αγοράς...</p>
      </div>
    );
  }

  if (isError || !market) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-danger-border) bg-danger-subtle p-6 text-(--color-text-heading)">
        <h6 className="text-sm font-semibold text-(--color-text-heading)">Στοιχεία Αγοράς</h6>
        <p className="text-sm text-(--color-danger)">{error?.message ?? "Η φόρτωση των στοιχείων αγοράς απέτυχε."}</p>
        <CustomButton title="Επιστροφή στη λίστα αγορών" backgroundColor="var(--color-text-muted)" width="fit-content" onClick={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 text-left overflow-hidden">
      <Box className="w-full flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="font-semibold text-(--color-text-heading)">Στοιχεία Αγοράς</h2>
          <h3 className="text-lg text-(--color-text-heading)">{market.name || `Αγορά #${market.id}`}</h3>
        </div>
        <CustomButton title="Επιστροφή στη λίστα αγορών" backgroundColor="var(--color-text-muted)" width="fit-content" onClick={handleBackToList} />
      </Box>

      <div className="flex-1 overflow-y-auto pr-2 mt-2 ">
        <div className="flex flex-col gap-6">
          <div>
            <MarketForm mode="view" values={formValues} onChange={() => {}} onSubmit={undefined} submitLabel={""} />
          </div>
        </div>
      </div>
    </div>
  );
}
