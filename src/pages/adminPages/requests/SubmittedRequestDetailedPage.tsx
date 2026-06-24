import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { CircularProgress, Alert, Divider } from "@mui/material";
import CustomInputField from "../../../shared/components/CustomInputField";
import { useAuthStore } from '../../../store/authStore';
import { USER_ROLE_MAPPING } from '../../../shared/mappings/users.mapping';
import { useSubmittedRequestDetailQuery } from "../../../queries/requestQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import type { RequestStatus } from "../../../models/request";
import EditRequestScoreModal from "../../../components/requests/EditRequestScoreModal";
import { useUpdateRequestScoreMutation } from "../../../queries/requestQueries";
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";


const statusLabels: Record<RequestStatus, { label: string; color: string }> = {
  0: { label: "Σε Αναμονή", color: "#f59e0b" },
  3: { label: "Εγκεκριμένο", color: "#10b981" },
  4: { label: "Απορριφθέν", color: "#ef4444" },
};

export default function SubmittedRequestDetailedPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams({ strict: false });
  const { data: request, isLoading, error } = useSubmittedRequestDetailQuery(id as string);

  const { role } = useAuthStore();
  const isAdmin = (role ?? '').trim().toLowerCase() === (USER_ROLE_MAPPING.ADMIN ?? '').trim().toLowerCase();

  const [isEditScoreOpen, setIsEditScoreOpen] = useState(false);
  const updateScoreMutation = useUpdateRequestScoreMutation();

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

  const totalFieldWeight = request.fieldValues.reduce((sum, f) => sum + (Number(f.weight ?? 0)), 0);

  return (
    <div className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-(--color-text-heading)">Στοιχεία Αίτησης #{request.id}</h2>
          <div className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: statusInfo.color }}>
            {statusInfo.label}
          </div>
        </div>

        <div className="flex border-b border-(--color-border) mb-6">
          <button
            onClick={() => setActiveTab(0)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 0
                ? 'text-(--color-primary) border-b-2 border-(--color-primary)'
                : 'text-(--color-text-muted) hover:text-(--color-text-heading)'
            }`}
          >
            Στοιχεία Πωλητή
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 1
                ? 'text-(--color-primary) border-b-2 border-(--color-primary)'
                : 'text-(--color-text-muted) hover:text-(--color-text-heading)'
            }`}
          >
            Συμπληρωμένα Πεδία
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 2
                ? 'text-(--color-primary) border-b-2 border-(--color-primary)'
                : 'text-(--color-text-muted) hover:text-(--color-text-heading)'
            }`}
          >
            Συνημένα Έγγραφα
          </button>
        </div>

        {activeTab === 0 && (
          <div className="space-y-4 rounded-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ονοματεπώνυμο
                </label>
                <CustomInputField value={request.sellerFullName || ""} disabled width="100%" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  ΑΦΜ
                </label>
                <CustomInputField value={request.sellerAfm || ""} disabled width="100%" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Τύπος Πωλητή
                </label>
                <CustomInputField
                  value={request.sellerType !== undefined ? SELLER_TYPE_LABELS[Number(request.sellerType)] || String(request.sellerType) : ""}
                  disabled
                  width="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Αριθμός Άδειας Πωλητή
                </label>
                <CustomInputField value={request.sellerLicenseNumber || ""} disabled width="100%" />
              </div>
            </div>

            <hr className="border-(--color-border) my-4" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Ημερομηνία Υποβολής
                </label>
                <CustomInputField value={new Date(request.submittedAt).toLocaleString("el-GR")} disabled width="100%" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-(--color-text-heading)">
                  Αίτηση για Συμμετοχή στις Αγορές
                </label>
                <CustomInputField
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
                        <label className="text-sm font-semibold text-(--color-text-heading) truncate">
                          {field.fieldLabel}
                        </label>
                        <CustomInputField value={field.value || ""} disabled width="100%" />
                      </div>
                      <div className="flex flex-col gap-1" style={{ flex: '0 0 10%' }}>
                        <label className="text-sm font-semibold text-(--color-text-heading)">
                          Βάρος
                        </label>
                        <CustomInputField type="NUMBER" value={field.weight ?? 0} disabled width="100%" />
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

        {activeTab === 3 && (
          <div className="space-y-4 rounded-lg">
            {request.processedAt || request.notes || request.rejectionReason ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {request.processedAt && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-(--color-text-heading)">
                      Ημερομηνία Επεξεργασίας
                    </label>
                    <CustomInputField value={new Date(request.processedAt).toLocaleString("el-GR")} disabled width="100%" />
                  </div>
                )}
                {request.notes && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-(--color-text-heading)">
                      Σημειώσεις
                    </label>
                    <CustomInputField type="TEXTAREA" value={request.notes} disabled width="100%" />
                  </div>
                )}
                {request.rejectionReason && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-(--color-danger)">
                      Λόγος Απόρριψης
                    </label>
                    <CustomInputField type="TEXTAREA" value={request.rejectionReason} disabled width="100%" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-(--color-text-muted)">
                Δεν υπάρχουν σημειώσεις επεξεργασίας.
              </p>
            )}
          </div>
        )}

        
      {isAdmin && (
          <div className="mt-6">
            <Divider className="my-6" />
            <div className="p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-(--color-text-heading) mb-2">Σύνοψη Βαθμολογίας</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                  <div>
                    <div className="text-sm text-(--color-text-muted)">Σύνολο βαρών πεδίων</div>
                    <div className="text-xl font-bold">{totalFieldWeight}</div>
                  </div>
              
                <div>
                  <div className="text-sm text-(--color-text-muted)">Βαθμολογία Αίτησης</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">{request.score ?? '—'}</div>
                    <Tooltip title="Επεξεργασία βαθμολογίας">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => setIsEditScoreOpen(true)}
                          aria-label="edit-score"
                          sx={{
                            bgcolor: '#D2B48C',
                            color: '#1f1f1f',
                            width: 25,
                            height: 25,
                            padding: 0,
                            '&:hover': { bgcolor: '#c6a77a' },
                            boxShadow: 'none',
                          }}
                        >
                          <EditIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
         )}
        <EditRequestScoreModal
          open={isEditScoreOpen}
          onClose={() => setIsEditScoreOpen(false)}
          initialScore={request.score ?? null}
          saving={updateScoreMutation.status === 'pending'}
          onSave={({ score, note }) => {
            if (!id) return;
            updateScoreMutation.mutate({ id: id as string, payload: { score, note } }, {
              onSuccess: () => {
                setIsEditScoreOpen(false);
              },
            });
          }}
        />
      </div>
    </div>
  );
}
