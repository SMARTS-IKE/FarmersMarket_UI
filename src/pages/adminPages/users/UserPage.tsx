import { useEffect, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import CustomButton from '../../../shared/components/CustomButton';
import CustomInputField from '../../../shared/components/CustomInputField';
import {
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../../queries/userQueries';

const ROLE_OPTIONS = [
  'Admin',
  'SystemAdmin',
  'Seller',
  'Customer',
] as const;

const editableFieldSx = {
  '& .MuiInputBase-root': {
    justifyContent: 'center',
  },
  '& .MuiInputBase-input': {
    textAlign: 'center',
    color: 'var(--color-text-heading)',
  },
  '& .MuiInputLabel-root': {
    left: '50%',
    transform: 'translateX(-50%)',
    transformOrigin: 'center',
    color: 'var(--color-text-heading)',
    fontWeight: 500,
    width: 'max-content',
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(-50%, 1.5px) scale(0.75)',
  },
  '& .MuiInput-underline:before, & .MuiInput-underline:after': {
    borderBottomColor: 'var(--color-dark)',
    borderBottomWidth: '3px',
  },
};

export default function UserPage() {
  const params = useParams({ strict: false });
  const userId = typeof params.id === 'string' ? params.id : '';
  const { data: user, isLoading, isError, error } = useUserQuery(userId);
  const updateUserMutation = useUpdateUserMutation(userId);
  const assignRoleMutation = useAssignUserRoleMutation(userId);
  const removeRoleMutation = useRemoveUserRoleMutation(userId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setIsActive(Boolean(user.isActive));
    setSelectedRoles(user.roles ?? []);
    setSaveMessage(null);
    setSaveError(null);
  }, [user]);

  const isSavingUser = updateUserMutation.isPending;
  const isUpdatingRole = assignRoleMutation.isPending || removeRoleMutation.isPending;
  const originalRoles = user?.roles ?? [];
  const rolesToAdd = selectedRoles.filter((role) => !originalRoles.includes(role));
  const rolesToRemove = originalRoles.filter((role) => !selectedRoles.includes(role));
  const hasRoleChanges = rolesToAdd.length > 0 || rolesToRemove.length > 0;

  async function handleSave() {
    setSaveMessage(null);
    setSaveError(null);

    try {
      await updateUserMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isActive,
      });

      await Promise.all([
        ...rolesToAdd.map((role) => assignRoleMutation.mutateAsync({ role })),
        ...rolesToRemove.map((role) => removeRoleMutation.mutateAsync(role)),
      ]);

      setSaveMessage('Οι αλλαγές χρήστη και ρόλων αποθηκεύτηκαν.');
    } catch (mutationError) {
      setSaveError(mutationError instanceof Error ? mutationError.message : 'Η αποθήκευση απέτυχε.');
    }
  }

  function handleRoleToggle(role: string) {
    setSaveMessage(null);
    setSaveError(null);

    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((currentRole) => currentRole !== role)
        : [...current, role]
    );
  }

  const hasUserChanges =
    firstName !== (user?.firstName ?? '') ||
    lastName !== (user?.lastName ?? '') ||
    isActive !== Boolean(user?.isActive);
  const hasPendingChanges = hasUserChanges || hasRoleChanges;

  if (!userId) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία χρήστη</h1>
        <p className="text-sm text-(--color-text-muted)">Δεν βρέθηκε έγκυρο αναγνωριστικό χρήστη.</p>
        <Link to="/admin/users" className="text-sm font-medium text-(--color-primary)">
          Επιστροφή στη λίστα χρηστών
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία χρήστη</h1>
        <p className="text-sm text-(--color-text-muted)">Φόρτωση στοιχείων χρήστη...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-danger-border) bg-danger-subtle p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία χρήστη</h1>
        <p className="text-sm text-(--color-danger)">{error?.message ?? 'Η φόρτωση των στοιχείων χρήστη απέτυχε.'}</p>
        <Link to="/admin/users" className="text-sm font-medium text-(--color-primary)">
          Επιστροφή στη λίστα χρηστών
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 text-left text-(--color-text-heading) md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em]">{firstName || '—'} {lastName || ''}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
              title={isSavingUser || isUpdatingRole ? 'Αποθήκευση...' : 'Αποθήκευση αλλαγών'}
              onClick={handleSave}
              disabled={!hasPendingChanges || isSavingUser || isUpdatingRole}
              width={190}
              backgroundColor="var(--color-text)"
              sx={{ borderRadius: '9999px' }}
            />
            <Link
              to="/admin/users"
              className="rounded-full border border-(--color-text-muted) bg-white/80 px-5 py-2 text-sm font-medium text-(--color-text-heading) shadow-[0_3px_12px_rgba(60,40,10,0.08)]"
            >
              Επιστροφή στη λίστα χρηστών
            </Link>
          </div>
        </div>

        {saveError && (
          <div className="rounded-xl border border-(--color-danger-border) bg-danger-subtle px-4 py-3 text-sm text-(--color-danger)">
            {saveError}
          </div>
        )}

        {saveMessage && (
          <div className="rounded-xl border border-(--color-success-border) bg-success-subtle px-4 py-3 text-sm text-(--color-success)">
            {saveMessage}
          </div>
        )}

        <section className="grid content-start gap-10">
          <div className="mx-auto grid w-full max-w-3xl gap-8 md:grid-cols-2 mb-10">
              <div className="md:col-span-2">
                <CustomInputField
                  type="TEXT"
                  label="Ηλεκτρονικό ταχυδρομείο *"
                  value={user.email || '—'}
                  disabled
                  width="100%"
                  sx={{
                    ...editableFieldSx,
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'var(--color-text-muted)',
                      textAlign: 'center',
                      opacity: 1,
                    },
                  }}
                />
              </div>
              <CustomInputField
                type="TEXT"
                label="Όνομα"
                value={firstName}
                onChange={(value) => setFirstName(String(value))}
                width="100%"
                sx={editableFieldSx}
              />
              <CustomInputField
                type="TEXT"
                label="Επώνυμο"
                value={lastName}
                onChange={(value) => setLastName(String(value))}
                width="100%"
                sx={editableFieldSx}
              />
          </div>

          <div className="grid gap-16 xl:grid-cols-2 xl:items-start">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <CustomButton
                    title="Ενεργός"
                    onClick={() => setIsActive(true)}
                    width="100%"
                    disabled={isSavingUser || isUpdatingRole}
                    backgroundColor={isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)'}
                    sx={{
                      minHeight: 44,
                      borderRadius: '0.75rem',
                      border: isActive ? '1px solid transparent' : '1px solid var(--color-text-muted)',
                      color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                      boxShadow: isActive ? '0 6px 16px rgba(74,63,53,0.18)' : '0 1px 2px rgba(60,40,10,0.08)',
                      '&:hover': {
                        backgroundColor: isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)',
                        filter: 'none',
                      },
                    }}
                  />
                  <CustomButton
                    title="Ανενεργός"
                    onClick={() => setIsActive(false)}
                    width="100%"
                    disabled={isSavingUser || isUpdatingRole}
                    backgroundColor={!isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)'}
                    sx={{
                      minHeight: 44,
                      borderRadius: '0.75rem',
                      border: !isActive ? '1px solid transparent' : '1px solid var(--color-text-muted)',
                      color: !isActive ? '#ffffff' : 'var(--color-text-muted)',
                      boxShadow: !isActive ? '0 6px 16px rgba(74,63,53,0.18)' : '0 1px 2px rgba(60,40,10,0.08)',
                      '&:hover': {
                        backgroundColor: !isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)',
                        filter: 'none',
                      },
                    }}
                  />
                </div>
                <div className="border-t-3 border-(--color-dark) pt-2 text-center text-sm font-medium text-(--color-text-heading)">
                  Κατάσταση
                </div>

                {/* <div className="rounded-[22px] border border-dashed border-(--color-border) bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-4 border-white bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#e7ddc5_72%)] text-3xl font-semibold text-(--color-text-muted) shadow-[0_8px_24px_rgba(60,40,10,0.10)]">
                      {getInitials(firstName, lastName)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="inline-flex rounded-xl bg-(--color-text) px-4 py-2 text-sm font-medium text-white">
                        Προφίλ χρήστη
                      </div>
                      <p className="text-sm leading-6 text-(--color-text-muted)">
                        Δημιουργία: {formatDate(user.createAt)}
                      </p>
                      <p className="text-sm leading-6 text-(--color-text-muted)">
                        Τρέχουσα κατάσταση: {renderStatus(isActive)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t-3 border-(--color-dark) pt-2 text-center text-sm font-medium text-(--color-text-heading)">
                  Επιλεγμένο προφίλ
                </div> */}
            </div>

            <div className="grid content-start gap-4">
              <div className="grid grid-cols-2 gap-4">
              {[
                ...ROLE_OPTIONS.map((role) => ({ label: role, active: selectedRoles.includes(role) })),
              ].map((role) => (
                <CustomButton
                  key={role.label}
                  title={role.label}
                  width="100%"
                  onClick={() => handleRoleToggle(role.label)}
                  disabled={isSavingUser || isUpdatingRole}
                  backgroundColor={role.active ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)'}
                  sx={{
                    minHeight: 44,
                    height: '100%',
                    borderRadius: '0.75rem',
                    border: role.active ? '1px solid transparent' : '1px solid var(--color-text-muted)',
                    color: role.active ? '#ffffff' : 'var(--color-text)',
                    boxShadow: '0 1px 2px rgba(60,40,10,0.08)',
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    whiteSpace: 'normal',
                    paddingInline: '0.75rem',
                    '&:hover': {
                      backgroundColor: role.active ? 'var(--color-text)' : 'rgba(255,255,255,0.85)',
                      filter: 'none',
                    },
                  }}
                />
              ))}
              </div>
              <div className="border-t-3 border-(--color-dark) pt-2 text-center text-sm font-medium text-(--color-text-heading)">
                Ρόλος
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}