import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import CustomInputField from "../../shared/components/CustomInputField";
import { SELLER_TYPE_LABELS } from "../sellers/sellers.utils";
import { useSellerQuery } from "../../queries/sellerQueries";

type Props = {
  request: any;
};

export default function SubmittedRequestForm({ request }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  if (!request) return null;

  const sellerIdStr = request.sellerId ? String(request.sellerId) : '';
  const { data: seller } = useSellerQuery(sellerIdStr);

  const displayName = seller?.fullName ?? ((seller?.firstName || seller?.lastName) ? `${seller?.firstName ?? ''} ${seller?.lastName ?? ''}`.trim() : undefined) ?? request.sellerFullName ?? '';
  const displayAfm = seller?.afm ?? request.sellerAfm ?? '';
  const stVal = seller?.sellerType ?? seller?.currentLicense?.sellerType ?? request.sellerType;
  const displaySellerType = stVal !== undefined && stVal !== null ? (SELLER_TYPE_LABELS[Number(stVal)] ?? String(stVal)) : '—';
  let displayLicenseNumber: string | undefined;
  if (seller?.currentLicense) {
    displayLicenseNumber = seller.currentLicense.licenseNumber ?? undefined;
  }
  if (!displayLicenseNumber && Array.isArray(seller?.licenses) && seller.licenses.length > 0) {
    displayLicenseNumber = seller.licenses[0].number ?? undefined;
  }
  displayLicenseNumber = displayLicenseNumber ?? request.sellerLicenseNumber ?? request.licenseNumber ?? '—';

  return (
    <>
      <Box className="w-full self-start mb-4">
        <Tabs
          value={activeTab}
          onChange={(_e, next) => setActiveTab(next)}
          variant="fullWidth"
          textColor="inherit"
          sx={{ width: "100%" }}
        >
          <Tab label="Στοιχεία Πωλητή" />
          <Tab label="Συμπληρωμένα Πεδία" />
          <Tab label="Συνημένα Έγγραφα" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <div className="space-y-4 rounded-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-(--color-text-heading)">Ονοματεπώνυμο</label>
              <CustomInputField value={displayName || ""} disabled width="100%" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-(--color-text-heading)">ΑΦΜ</label>
              <CustomInputField value={displayAfm || ""} disabled width="100%" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-(--color-text-heading)">Τύπος Πωλητή</label>
              <CustomInputField
                value={displaySellerType}
                disabled
                width="100%"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-(--color-text-heading)">Αριθμός Άδειας Πωλητή</label>
              <CustomInputField value={displayLicenseNumber} disabled width="100%" />
            </div>
          </div>

          <hr className="border-(--color-border) my-4" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-(--color-text-heading)">Ημερομηνία Υποβολής</label>
              <CustomInputField value={new Date(request.submittedAt).toLocaleString("el-GR")} disabled width="100%" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-(--color-text-heading)">Αίτηση για Συμμετοχή στις Αγορές</label>
              <CustomInputField
                value={request.markets.map((m: any) => m.marketName).join(", ") || "Δεν έχει αιτηθεί για συγκεκριμένες αγορές"}
                disabled
                width="100%"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4 rounded-lg">
          {request.fieldValues && request.fieldValues.length > 0 ? (
            <div className="space-y-4">
              {request.fieldValues.map((field: any) => (
                <div key={field.id} className="flex flex-col gap-2 pb-4 border-b border-(--color-border) last:border-b-0">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1" style={{ flex: "0 0 90%" }}>
                      <label className="text-sm font-semibold text-(--color-text-heading) truncate">{field.fieldLabel}</label>
                      <CustomInputField value={field.value || ""} disabled width="100%" />
                    </div>
                    <div className="flex flex-col gap-1" style={{ flex: "0 0 10%" }}>
                      <label className="text-sm font-semibold text-(--color-text-heading)">Βάρος</label>
                      <CustomInputField type="NUMBER" value={field.weight ?? 0} disabled width="100%" />
                    </div>
                  </div>
                  {field.reviewComment && <p className="text-xs text-(--color-danger) mt-1">Σχόλιο: {field.reviewComment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-(--color-text-muted)">Δεν υπάρχουν επιπλέον πεδία στην αίτηση.</p>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-4 rounded-lg">
          {request.documents && request.documents.length > 0 ? (
            <div className="space-y-3">
              {request.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-(--color-border) rounded-lg hover:bg-(--color-bg) transition">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-(--color-text-heading)">{doc.title || doc.name || "Έγγραφο χωρίς όνομα"}</p>
                    {doc.fileName && <p className="text-xs text-(--color-text-muted) mt-1">{doc.fileName}</p>}
                  </div>
                  <button
                    onClick={() => {
                      if (doc.downloadUrl) {
                        window.open(doc.downloadUrl, "_blank");
                      } else if (doc.url) {
                        window.open(doc.url, "_blank");
                      }
                    }}
                    disabled={!doc.downloadUrl && !doc.url}
                    className="ml-4 px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-hover) transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Λήψη
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-(--color-text-muted)">Δεν υπάρχουν συνημένα έγγραφα.</p>
          )}
        </div>
      )}
    </>
  );
}
