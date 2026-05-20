import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useBlocker, useNavigate, useParams } from '@tanstack/react-router';
import { Alert, Snackbar } from '@mui/material';
import CustomButton from '../../shared/components/CustomButton';
import CustomInputField from '../../shared/components/CustomInputField';
import {
  useAssignUserRoleMutation,
  useReinitializeUserPasswordMutation,
  useRemoveUserRoleMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '../../queries/userQueries';
import { USER_ROLE_MAPPING_TITLES } from '../../shared/mappings/users.mapping';

const ROLE_OPTIONS = USER_ROLE_MAPPING_TITLES ? Object.values(USER_ROLE_MAPPING_TITLES) : [];
const ROLE_KEYS = USER_ROLE_MAPPING_TITLES ? Object.keys(USER_ROLE_MAPPING_TITLES) : [];

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
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const userId = typeof params.id === 'string' ? params.id : '';
  const { data: user, isLoading, isError, error } = useUserQuery(userId);
  const updateUserMutation = useUpdateUserMutation(userId);
  const assignRoleMutation = useAssignUserRoleMutation(userId);
  const removeRoleMutation = useRemoveUserRoleMutation(userId);
  const reinitializePasswordMutation = useReinitializeUserPasswordMutation(userId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');
  const [initialIsActive, setInitialIsActive] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [initialSelectedRoles, setInitialSelectedRoles] = useState<string[]>([]);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'warning' | 'error'>('warning');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const nextFirstName = user.firstName ?? '';
    const nextLastName = user.lastName ?? '';
    const nextIsActive = Boolean(user.isActive);
    const nextRoles = user.roles ?? [];
    setFirstName(nextFirstName);
    setLastName(nextLastName);
    setIsActive(nextIsActive);
    setSelectedRoles(nextRoles);
    setInitialFirstName(nextFirstName);
    setInitialLastName(nextLastName);
    setInitialIsActive(nextIsActive);
    setInitialSelectedRoles(nextRoles);
    setIsNavigationLocked(false);
    setNotificationMessage('');
    setIsSnackbarOpen(false);
  }, [user]);

  const isSavingUser = updateUserMutation.isPending;
  const isUpdatingRole = assignRoleMutation.isPending || removeRoleMutation.isPending;
  const isReinitializingPassword = reinitializePasswordMutation.isPending;
  const rolesToAdd = selectedRoles.filter((role) => !initialSelectedRoles.includes(role));
  const rolesToRemove = initialSelectedRoles.filter((role) => !selectedRoles.includes(role));
  const hasRoleChanges = useMemo(() => {
    if (selectedRoles.length !== initialSelectedRoles.length) return true;
    const selectedRolesSet = new Set(selectedRoles);
    return initialSelectedRoles.some((role) => !selectedRolesSet.has(role));
  }, [initialSelectedRoles, selectedRoles]);

  const hasUserChanges =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    isActive !== initialIsActive;
  const hasPendingChanges = hasUserChanges || hasRoleChanges;

  const showNotification = (message: string, severity: 'success' | 'warning' | 'error' = 'warning') => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setIsSnackbarOpen(true);
  };

  useEffect(() => {
    if (hasPendingChanges) {
      setIsNavigationLocked(true);
    }
  }, [hasPendingChanges]);

  useBlocker({
    shouldBlockFn: () => {
      if (!isNavigationLocked) return false;
      showNotification('Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.', 'warning');
      return true;
    },
    enableBeforeUnload: isNavigationLocked,
  });

  async function handleSave() {
    if (!hasPendingChanges) return;

    setNotificationMessage('');
    setIsSnackbarOpen(false);

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

      setInitialFirstName(firstName);
      setInitialLastName(lastName);
      setInitialIsActive(isActive);
      setInitialSelectedRoles(selectedRoles);
      setIsNavigationLocked(false);
      showNotification('Οι αλλαγές χρήστη και ρόλων αποθηκεύτηκαν.', 'success');
    } catch (mutationError) {
      showNotification(mutationError instanceof Error ? mutationError.message : 'Η αποθήκευση απέτυχε.', 'error');
    }
  }

  function handleCancel() {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setIsActive(initialIsActive);
    setSelectedRoles(initialSelectedRoles);
    setNotificationMessage('');
    setIsSnackbarOpen(false);
    setIsNavigationLocked(false);
  }

  function handleRoleToggle(role: string) {
    setNotificationMessage('');
    setIsSnackbarOpen(false);

    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((currentRole) => currentRole !== role)
        : [...current, role]
    );
  }

  const handleBackToList = () => {
    if (isNavigationLocked) {
      showNotification('Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.', 'warning');
      return;
    }

    navigate({ to: "/admin/users" });
  };

  const handleReinitializePassword = async () => {
    setNotificationMessage('');
    setIsSnackbarOpen(false);

    try {
      await reinitializePasswordMutation.mutateAsync();
      showNotification('Ο κωδικός του χρήστη επαναρχικοποιήθηκε επιτυχώς.', 'success');
    } catch (mutationError) {
      showNotification(
        mutationError instanceof Error
          ? mutationError.message
          : 'Η επαναρχικοποίηση κωδικού απέτυχε.',
        'error'
      );
    }
  };

  const handleSnackbarClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return;
    setIsSnackbarOpen(false);
  };

  if (!userId) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία χρήστη</h1>
        <p className="text-sm text-(--color-text-muted)">Δεν βρέθηκε έγκυρο αναγνωριστικό χρήστη.</p>
        <CustomButton
          title="Επιστροφή στη λίστα χρηστών"
          onClick={handleBackToList}
          width="fit-content"
          backgroundColor="var(--color-text-muted)"
        />
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
        <CustomButton
          title="Επιστροφή στη λίστα χρηστών"
          onClick={handleBackToList}
          width="fit-content"
          backgroundColor="var(--color-text-muted)"
        />
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
                      title="Επιστροφή στη λίστα χρηστών"
                      backgroundColor="var(--color-text-muted)"
                      width="fit-content"
                      onClick={handleBackToList} />
          </div>
        </div>

        <section className="grid content-start gap-10">
          <div className="mx-auto grid w-full max-w-3xl gap-8 md:grid-cols-2 mb-10">
              <div className="md:col-span-2">
                <CustomInputField
                  type="TEXT"
                  label="Ηλεκτρονικό ταχυδρομείο"
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

          <div className="grid gap-16 xl:grid-cols-1 xl:items-start">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <CustomButton
                    title="Ενεργός"
                    onClick={() => setIsActive(true)}
                    width="100%"
                    disabled={isSavingUser || isUpdatingRole}
                    backgroundColor="transparent"
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      border: 'none',
                      color: isActive ? 'var(--color-dark)' : 'var(--color-text-muted)',
                      boxShadow: 'none',
                      textDecoration: isActive ? 'underline' : 'none',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        filter: 'none',
                      },
                    }}
                  />
                  <CustomButton
                    title="Ανενεργός"
                    onClick={() => setIsActive(false)}
                    width="100%"
                    disabled={isSavingUser || isUpdatingRole}
                    backgroundColor="transparent"
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      border: 'none',
                      color: !isActive ? 'var(--color-dark)' : 'var(--color-text-muted)',
                      boxShadow: 'none',
                      textDecoration: !isActive ? 'underline' : 'none',
                      '&:hover': {
                        backgroundColor: 'transparent',
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
                ...ROLE_KEYS.map((role, index) => ({ label: role, active: selectedRoles.includes(role), index })),
              ].map((role) => (
                <CustomButton
                  key={role.label}
                  title={ROLE_OPTIONS[role.index] || ''}
                  width="100%"
                  onClick={() => handleRoleToggle(role.label)}
                  disabled={false}
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

        <div className="flex flex-wrap justify-end gap-3">
          <CustomButton
            title={isReinitializingPassword ? 'Επαναρχικοποίηση...' : 'Επαναρχικοποίηση Κωδικού'}
            backgroundColor="var(--color-text-muted)"
            onClick={handleReinitializePassword}
            disabled={isReinitializingPassword}
            width={220}
          />

          {isNavigationLocked && (
            <CustomButton
              title="Ακύρωση"
              backgroundColor="transparent"
              onClick={handleCancel}
              disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
              width={120}
              sx={{
                color: 'var(--color-dark)',
                border: '1px solid var(--color-text-muted)',
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-text-muted)',
                  filter: 'none',
                },
              }}
            />
          )}

          {hasPendingChanges && (
            <CustomButton
              title={isSavingUser || isUpdatingRole ? 'Αποθήκευση...' : 'Αποθήκευση'}
              onClick={handleSave}
              disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
              width={140}
            />
          )}
        </div>
      </div>

      <Snackbar
        open={isSnackbarOpen && Boolean(notificationMessage)}
        autoHideDuration={4500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={notificationSeverity} variant="filled" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}