import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { CircularProgress, Alert, Tab, Tabs, Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmActionDialog from "../../../shared/components/ConfirmActionDialog";
import { useSubmittedRequestDetailQuery } from "../../../queries/requestQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import type { RequestStatus } from "../../../models/request";
import { OpenInNew } from "@mui/icons-material";

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle) disabled:opacity-50 disabled:cursor-not-allowed';

const statusLabels: Record<RequestStatus, { label: string; color: string }> = {
  0: { label: "Σε Αναμονή", color: "#f59e0b" },
  1: { label: "Εγκεκριμένο", color: "#10b981" },
  2: { label: "Απορριφθέν", color: "#ef4444" },
};

export default function SubmittedRequestDetailedPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });
  const { data: request, isLoading, error } = useSubmittedRequestDetailQuery(id as string);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="m-4">
        <Alert severity="error">
          Σφάλμα κατά την ανάκτηση των στοιχείων της αίτησης: {error?.message || "Η αίτηση δεν βρέθηκε."}
        </Alert>
      </div>
    );
  }

  const statusInfo = statusLabels[request.status];

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);

  const [fieldValuesLocal, setFieldValuesLocal] = useState(() => request.fieldValues ?? []);
  const [editingFieldId, setEditingFieldId] = useState<string | number | null>(null);
  const [editedWeight, setEditedWeight] = useState<number | string>(0);

  useEffect(() => {
    setFieldValuesLocal(request.fieldValues ?? []);
  }, [request.fieldValues]);

  const openConfirm = (action: 'accept' | 'reject') => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    if (confirmAction === 'accept') {
      // TODO: wire accept mutation
      console.log('Accepted request', request.id);
    } else if (confirmAction === 'reject') {
      // TODO: wire reject mutation
      console.log('Rejected request', request.id);
    }

    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="px-2 py-1 rounded text-white font-semibold text-sm"
              style={{ backgroundColor: statusInfo.color }}
            >
              {statusInfo.label}
            </div>
            <h2 className="text-xl font-semibold text-(--color-text-heading)">Στοιχεία Αίτησης #{request.id}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openConfirm('accept')}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              aria-label="Accept request"
            >
              Αποδοχή
            </button>
            <button
              onClick={() => openConfirm('reject')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              aria-label="Reject request"
            >
              Απόρριψη
            </button>
          </div>
        </div>

          <div className="mb-6">
          <Box>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              textColor="inherit"
              sx={{ width: "100%" }}
            >
              <Tab label="Στοιχεία Πωλητή" />
              <Tab label="Συμπληρωμένα Πεδία" />
              <Tab label="Συνημένα Έγγραφα" />
            </Tabs>
          </Box>
        </div>

          <ConfirmActionDialog
            open={confirmDialogOpen}
            action={confirmAction}
            onClose={handleCancelConfirm}
            onConfirm={handleConfirm}
          />

        {activeTab === 0 && (
          <div className="space-y-4 bg-white rounded-lg p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ονοματεπώνυμο
                </label>
                <div className="flex items-center gap-2 px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg)">
                  <input
                    type="text"
                    value={request.sellerFullName || ""}
                    disabled
                    className="flex-1 bg-transparent text-(--color-text-heading) outline-none disabled:opacity-100"
                  />
                  <button
                    onClick={() => navigate({ to: `/admin/sellers/${request.sellerId}` })}
                    className="p-1 text-(--color-primary) hover:text-(--color-primary-hover) transition"
                    title="Προβολή Προφίλ Πωλητή"
                  >
                    <OpenInNew className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  ΑΦΜ
                </label>
                <input
                  type="text"
                  value={request.sellerAfm || ""}
                  disabled
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Τύπος Πωλητή
                </label>
                <input
                  type="text"
                  value={request.sellerType !== undefined ? SELLER_TYPE_LABELS[Number(request.sellerType)] || String(request.sellerType) : ""}
                  disabled
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Αριθμός Άδειας Πωλητή
                </label>
                <input
                  type="text"
                  value={request.sellerLicenseNumber || ""}
                  disabled
                  className={inputClass}
                />
              </div>
            </div>

            <hr className="border-(--color-border) my-4" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ημερομηνία Υποβολής
                </label>
                <input
                  type="text"
                  value={new Date(request.submittedAt).toLocaleString("el-GR")}
                  disabled
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Αίτηση για Συμμετοχή στις Αγορές
                </label>
                <input
                  type="text"
                  value={request.markets.map((m) => m.marketName).join(", ") || "Δεν έχει αιτηθεί για συγκεκριμένες αγορές"}
                  disabled
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4 bg-white rounded-lg p-6">
            {request.fieldValues.length > 0 ? (
              <div className="space-y-4">
                {request.fieldValues.map((field) => (
                  <div key={field.id} className="flex flex-col gap-2 pb-4 border-b border-(--color-border) last:border-b-0">
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-1" style={{ flex: '0 0 82%' }}>
                        <label className="text-sm font-semibold text-(--color-text-heading) truncate">
                          {field.fieldLabel}
                        </label>
                        <input
                          type="text"
                          value={field.value || ""}
                          disabled
                          className={inputClass}
                        />
                      </div>
                      <div className="flex flex-col gap-1" style={{ flex: '0 0 18%' }}>
                        <label className="text-sm font-semibold text-(--color-text-heading)">
                          Βάρος
                        </label>
                        {editingFieldId === field.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={String(editedWeight)}
                              onChange={(e) => setEditedWeight(e.target.value)}
                              className={inputClass}
                              style={{ width: 72 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                setFieldValuesLocal((prev) =>
                                  prev.map((fv) => (fv.id === field.id ? { ...fv, weight: Number(editedWeight) } : fv))
                                );
                                setEditingFieldId(null);
                                console.log('Saved weight for field', field.id, editedWeight);
                              }}
                              sx={{ backgroundColor: 'var(--color-primary)', color: 'white', '&:hover': { backgroundColor: 'var(--color-primary-hover)' } }}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingFieldId(null);
                              }}
                              sx={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', '&:hover': { opacity: 0.9 } }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={String(fieldValuesLocal.find((fv) => fv.id === field.id)?.weight ?? 0)}
                              disabled
                              className={inputClass}
                              style={{ width: 72 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingFieldId(field.id);
                                setEditedWeight(field.weight ?? 0);
                              }}
                              sx={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', '&:hover': { opacity: 0.9 } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </div>
                        )}
                      </div>
                    </div>
                    {field.reviewComment && (
                      <p className="text-xs text-(--color-danger) mt-1">Σχόλιο: {field.reviewComment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-(--color-text-muted)">
                Δεν υπάρχουν επιπλέον πεδία στην αίτηση.
              </p>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4 bg-white rounded-lg p-6">
            {request.documents && request.documents.length > 0 ? (
              <div className="space-y-3">
                {request.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-(--color-border) rounded-lg hover:bg-(--color-bg) transition">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-(--color-text-heading)">
                        {doc.title || doc.name || "Έγγραφο χωρίς όνομα"}
                      </p>
                      {doc.fileName && (
                        <p className="text-xs text-(--color-text-muted) mt-1">{doc.fileName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (doc.downloadUrl) {
                          window.open(doc.downloadUrl, '_blank');
                        } else if (doc.url) {
                          window.open(doc.url, '_blank');
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

      </div>
    </div>
  );
}
