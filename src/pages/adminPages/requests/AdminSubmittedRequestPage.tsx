import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { CircularProgress, Alert, Divider } from "@mui/material";
import { useAuthStore } from '../../../store/authStore';
import { USER_ROLE_MAPPING } from '../../../shared/mappings/users.mapping';
import { useSubmittedRequestDetailQuery } from "../../../queries/requestQueries";
import type { RequestStatus } from "../../../models/request";
import EditRequestScoreModal from "../../../components/requests/EditRequestScoreModal";
import ConfirmActionDialog from "../../../components/requests/RequestActionConfirmDialog";
import { useUpdateRequestScoreMutation, useSetRequestStatusMutation } from "../../../queries/requestQueries";
import { queryClient } from '../../../lib/queryClient';
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SubmittedRequestForm from '../../../components/requests/SubmittedRequestForm';
import CustomButton from "../../../shared/components/CustomButton";


const statusLabels: Record<RequestStatus, { label: string; color: string }> = {
  0: { label: "Σε Αναμονή", color: "#f59e0b" },
  3: { label: "Εγκρίθηκε", color: "#10b981" },
  4: { label: "Απορρίφθηκε", color: "#ef4444" },
};

export default function AdminSubmittedRequestPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: request, isLoading, error } = useSubmittedRequestDetailQuery(id as string);

  const { role, user } = useAuthStore();
  const isAdmin = (role ?? '').trim().toLowerCase() === (USER_ROLE_MAPPING.ADMIN ?? '').trim().toLowerCase();

  const [isEditScoreOpen, setIsEditScoreOpen] = useState(false);
  const updateScoreMutation = useUpdateRequestScoreMutation();
  const setStatusMutation = useSetRequestStatusMutation();

  const handleApprove = () => {
    if (!request) return;
    setConfirmAction('accept');
    setConfirmOpen(true);
  };

  const handleReject = () => {
    if (!request) return;
    setConfirmAction('reject');
    setConfirmOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);

  const handleConfirmAction = (reason?: string) => {
    if (!request || !confirmAction) return;
    const processedByUserId = String(user?.id ?? '');
    const payloadBase = { processedByUserId } as any;
    if (confirmAction === 'accept') {
      setStatusMutation.mutate({ id: request.id, payload: { ...payloadBase, reason: '', status: 3 } }, {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries({ queryKey: ['requests', 'seller-list'], exact: false });
            await queryClient.invalidateQueries({ queryKey: ['requests'], exact: false });
            await queryClient.refetchQueries({ queryKey: ['requests', 'seller-list'], exact: false });
          } catch (e) {}
          try {
            window.dispatchEvent(new CustomEvent('app-notification', { detail: { type: 'success', message: 'Το αίτημα εγκρίθηκε.' } }));
          } catch (e) {}
          try {
            navigate({ to: "/admin/requests" } as any);
          } catch (e) {}
        },
        onError: (err: any) => {
          try { window.dispatchEvent(new CustomEvent('app-notification', { detail: { type: 'error', message: err?.message || 'Σφάλμα κατά την έγκριση της αίτησης.' } })); } catch (e) {}
        }
      });
    } else if (confirmAction === 'reject') {
      setStatusMutation.mutate({ id: request.id, payload: { ...payloadBase, reason: reason ?? '', status: 4 } }, {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries({ queryKey: ['requests', 'seller-list'], exact: false });
            await queryClient.invalidateQueries({ queryKey: ['requests'], exact: false });
            await queryClient.refetchQueries({ queryKey: ['requests', 'seller-list'], exact: false });
          } catch (e) {}
          try {
            window.dispatchEvent(new CustomEvent('app-notification', { detail: { type: 'success', message: 'Το αίτημα απορρίφθηκε.' } }));
          } catch (e) {}
          try {
            navigate({ to: "/admin/requests" } as any);
          } catch (e) {}
        },
        onError: (err: any) => {
          try { window.dispatchEvent(new CustomEvent('app-notification', { detail: { type: 'error', message: err?.message || 'Σφάλμα κατά την απόρριψη της αίτησης.' } })); } catch (e) {}
        }
      });
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

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
  const isFinalStatus = request.status === 3 || request.status === 4;

  const totalFieldWeight = request.fieldValues.reduce((sum: number, f: any) => sum + (Number(f.weight ?? 0)), 0);

  return (
    <div className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        {!isAdmin ? (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-md text-white font-semibold text-sm" style={{ backgroundColor: statusInfo.color }}>
                {statusInfo.label}
              </div>
              <h2 className="text-2xl font-semibold text-(--color-text-heading)">Στοιχεία Αίτησης #{request.id}</h2>
            </div>
            <div className="flex-shrink-0">
              <CustomButton
                title="Επιστροφή"
                onClick={() => navigate({ to: "/users/requests" } as any)}
                backgroundColor="var(--color-text-muted)"
                width={180}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-md text-white font-semibold text-sm" style={{ backgroundColor: statusInfo.color }}>
                  {statusInfo.label}
                </div>
                  <h2 className="text-2xl font-semibold text-(--color-text-heading)">Στοιχεία Αίτησης #{request.id}</h2>
              </div>
              <div className="flex items-center gap-2">
                {!isFinalStatus && (
                  <>
                    <CustomButton
                      title="Έγκριση"
                      onClick={handleApprove}
                      backgroundColor="#10b981"
                      width={120}
                      disabled={setStatusMutation.status === 'pending'}
                    />
                    <CustomButton
                      title="Απόρριψη"
                      onClick={handleReject}
                      backgroundColor="#ef4444"
                      width={120}
                      disabled={setStatusMutation.status === 'pending'}
                    />
                  </>
                )}
              </div>
            </div>
        )}

        {request.status === 4 && request.rejectionReason && (
          <div className="mb-4 flex flex-row items-center gap-2 font-bold bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] px-4 py-2 rounded-lg">
            <span className="text-sm ">Λόγος απόρριψης:</span>
            <span className="text-sm text-(--color-danger)">{request.rejectionReason}</span>
          </div>
        )}

        <SubmittedRequestForm request={request} />

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
                    {!isFinalStatus && (
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
         )}
        <EditRequestScoreModal
          open={isEditScoreOpen && !isFinalStatus}
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
        <ConfirmActionDialog
          open={confirmOpen}
          action={confirmAction}
          onClose={() => {
            setConfirmOpen(false);
            setConfirmAction(null);
          }}
          onConfirm={handleConfirmAction}
        />
      </div>
    </div>
  );
}
