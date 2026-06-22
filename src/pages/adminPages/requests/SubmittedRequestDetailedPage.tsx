import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { CircularProgress, Alert, Tab, Tabs, Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { queryClient } from "../../../lib/queryClient";
import { requestKeys } from "../../../queries/requestQueries";
import CustomInputField from "../../../shared/components/CustomInputField";
import { useSellerQuery } from "../../../queries/sellerQueries";
// Removed weight edit icons and functionality
// Restart icon and recalculation removed per request
import ConfirmActionDialog from "../../../shared/components/ConfirmActionDialog";
import { useSubmittedRequestDetailQuery, useSetRequestStatusMutation } from "../../../queries/requestQueries";
import { useAuthStore } from '../../../store/authStore';
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import { useGlobalEnums } from '../../../shared/components/GlobalEnums';
import { OpenInNew } from "@mui/icons-material";

const inputClass =
  'w-full px-4 py-3 text-[15px] rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-heading) placeholder:text-(--color-text-muted) outline-none transition focus:border-(--color-primary) focus:ring-3 focus:ring-(--color-primary-subtle) disabled:opacity-50 disabled:cursor-not-allowed';

const REQUEST_STATUS_COLORS: Record<number, string> = {
  0: '#f59e0b', // pending
  3: '#10b981', // approved
  4: '#ef4444', // rejected
};

export default function SubmittedRequestDetailedPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });
  const { data: request, isLoading, error } = useSubmittedRequestDetailQuery(id as string);
  // Weight review mutation removed
  const setStatusMutation = useSetRequestStatusMutation();
  const currentUser = useAuthStore((s) => s.user);

  const { RequestStatusLabels } = useGlobalEnums();

  // fetch seller details to obtain license info
  const { data: sellerDetails } = useSellerQuery(request?.sellerId ? String(request.sellerId) : "");

  const displaySellerName = sellerDetails
    ? `${sellerDetails.firstName ?? ""} ${sellerDetails.lastName ?? ""}`.trim() || request.sellerFullName
    : request.sellerFullName;

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);

  const [fieldValuesLocal, setFieldValuesLocal] = useState(() => [] as typeof request.fieldValues);
  // Weight editing removed — weights are displayed as read-only

  useEffect(() => {
    setFieldValuesLocal(request?.fieldValues ?? []);
  }, [request?.fieldValues]);

  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState(false);
  const [scoreInput, setScoreInput] = useState<number | string>(0);

  useEffect(() => {
    // Initialize total score from server if provided, otherwise sum local weights
    if (request) {
      if (typeof request.score === 'number' && !Number.isNaN(request.score)) {
        setTotalScore(request.score);
        setScoreInput(request.score);
      } else {
        const sum = (request.fieldValues ?? []).reduce((acc, fv) => acc + (fv.weight ?? 0), 0);
        setTotalScore(sum);
        setScoreInput(sum);
      }
    }
  }, [request]);

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

  const statusInfo = {
    label: RequestStatusLabels[request.status] ?? 'Άγνωστο',
    color: REQUEST_STATUS_COLORS[request.status] ?? '#6b7280',
  };

  const openConfirm = (action: 'accept' | 'reject') => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;

    const payloadBase = {
      reason: '',
      processedByUserId: String(currentUser?.id ?? ''),
    };

    if (confirmAction === 'accept') {
      setStatusMutation.mutate({ id: request.id, payload: { ...payloadBase, status: 3 } });
    } else if (confirmAction === 'reject') {
      setStatusMutation.mutate({ id: request.id, payload: { ...payloadBase, status: 4 } });
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

          {request.status === 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openConfirm('accept')}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Accept request"
                disabled={setStatusMutation.isLoading}
              >
                {setStatusMutation.isLoading ? 'Επεξεργασία...' : 'Αποδοχή'}
              </button>
              <button
                onClick={() => openConfirm('reject')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reject request"
                disabled={setStatusMutation.isLoading}
              >
                {setStatusMutation.isLoading ? 'Επεξεργασία...' : 'Απόρριψη'}
              </button>
            </div>
          )}
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
          <div className="space-y-4 rounded-lg ">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ονοματεπώνυμο
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <CustomInputField
                      type="TEXT"
                      value={displaySellerName || ""}
                      disabled
                      width="100%"
                    />
                  </div>
                  {/* <button
                    onClick={() => navigate({ to: `/admin/sellers/${request.sellerId}` })}
                    className="p-1 text-(--color-primary) hover:text-(--color-primary-hover) transition"
                    title="Προβολή Προφίλ Πωλητή"
                  >
                    <OpenInNew className="w-5 h-5" />
                  </button> */}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  ΑΦΜ
                </label>
                <CustomInputField
                  type="TEXT"
                  value={request.sellerAfm || ""}
                  disabled
                  width="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Τύπος Πωλητή
                </label>
                <CustomInputField
                  type="TEXT"
                  value={request.sellerType !== undefined ? SELLER_TYPE_LABELS[Number(request.sellerType)] || String(request.sellerType) : ""}
                  disabled
                  width="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Αριθμός Άδειας Πωλητή
                </label>
                <CustomInputField
                  type="TEXT"
                  value={request.sellerLicenseNumber || ""}
                  disabled
                  width="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ημερομηνία Έκδοσης Άδειας
                </label>
                <CustomInputField
                  type="TEXT"
                  value={
                    (sellerDetails as any)?.currentLicense?.issuedAt ?? (sellerDetails as any)?.currentLicense?.fromDate ?? ""
                  }
                  disabled
                  width="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ημερομηνία Λήξης Άδειας
                </label>
                <CustomInputField
                  type="TEXT"
                  value={
                    (sellerDetails as any)?.currentLicense?.expiresAt ?? (sellerDetails as any)?.currentLicense?.toDate ?? ""
                  }
                  disabled
                  width="100%"
                />
              </div>
            </div>

            <hr className="border-(--color-border) my-4" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ημερομηνία Υποβολής
                </label>
                <CustomInputField
                  type="TEXT"
                  value={new Date(request.submittedAt).toLocaleString("el-GR")}
                  disabled
                  width="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Αίτηση για Συμμετοχή στις Αγορές
                </label>
                <CustomInputField
                  type="TEXT"
                  value={request.markets.map((m) => m.marketName).join(", ") || "Δεν έχει αιτηθεί για συγκεκριμένες αγορές"}
                  disabled
                  width="100%"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4 rounded-lg">
            {request.fieldValues.length > 0 ? (
              <div className="space-y-4">
                {request.fieldValues.map((field) => (
                  <div key={field.id} className="flex flex-col gap-2 pb-4 border-b border-(--color-border) last:border-b-0">
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-1" style={{ flex: '0 0 90%' }}>
                          <label className="text-sm font-semibold text-(--color-text-heading)">
                          {field.fieldLabel}
                        </label>
                        <CustomInputField
                          type="TEXT"
                          value={field.value || ""}
                          disabled
                          width="100%"
                        />
                      </div>
                      <div className="flex flex-col gap-1" style={{ flex: '1 1 0%', minWidth: 100 }}>
                          <label className="text-sm font-semibold text-(--color-text-heading)">
                            Βάρος
                          </label>
                        <div className="flex items-center gap-2">
                            <CustomInputField
                              type="NUMBER"
                              value={String(fieldValuesLocal.find((fv) => fv.id === field.id)?.weight ?? 0)}
                              disabled
                              width={120}
                            />
                        </div>
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
          <div className="space-y-4 rounded-lg">
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

        {/* Total score (configurable) - boxed panel */}
        <div className="mt-6 flex justify-end">
          <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-(--color-border) bg-(--color-surface)">
            <div className="text-sm text-(--color-text-muted)">Συνολική Βαθμολογία:</div>
            {request.status === 0 ? (
              <div className="flex items-center gap-2">
                {!editingScore ? (
                  <>
                    <div className="text-xl font-semibold text-(--color-text-heading)">{totalScore ?? '-'}</div>
                    <IconButton
                      size="small"
                      onClick={() => { setEditingScore(true); setScoreInput(totalScore ?? 0); }}
                      title="Επεξεργασία βαθμολογίας"
                      aria-label="Επεξεργασία βαθμολογίας"
                      sx={{ p: 0.5, color: 'var(--color-text-muted)' }}
                      disableRipple
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div style={{ width: 140 }}>
                      <CustomInputField
                        type="NUMBER"
                        value={scoreInput}
                        onChange={(v) => setScoreInput(Number(String(v)) ?? 0)}
                        width={140}
                      />
                    </div>
                    <IconButton size="small" onClick={() => {
                      const num = Number(String(scoreInput)) || 0;
                      setTotalScore(num);
                      // update cache so query reflects change
                      try {
                        queryClient.setQueryData(requestKeys.submittedDetail(request.id), (old: any) => {
                          if (!old) return old;
                          return { ...old, score: num };
                        });
                      } catch (e) {
                        // ignore
                      }
                      setEditingScore(false);
                    }} title="Αποθήκευση βαθμολογίας" aria-label="Αποθήκευση βαθμολογίας">
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setEditingScore(false); setScoreInput(totalScore ?? 0); }} title="Ακύρωση" aria-label="Ακύρωση">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xl font-semibold text-(--color-text-heading)">{totalScore ?? '-'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
