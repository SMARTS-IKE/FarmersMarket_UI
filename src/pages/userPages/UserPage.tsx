import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useBlocker, useNavigate, useParams } from '@tanstack/react-router';
import { Alert, Snackbar } from '@mui/material';
import CustomButton from '../../shared/components/CustomButton';
import CustomInputField from '../../shared/components/CustomInputField';
import { setAuthNotification } from '../../lib/authNotifications';
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
  const allowProgrammaticNavigationRef = useRef(false);

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
    allowProgrammaticNavigationRef.current = false;
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
  const currentRoleKey = selectedRoles[0] ?? initialSelectedRoles[0] ?? '';
  const currentRoleTitle = currentRoleKey
    ? USER_ROLE_MAPPING_TITLES[currentRoleKey as keyof typeof USER_ROLE_MAPPING_TITLES] ?? currentRoleKey
    : '—';

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
      if (allowProgrammaticNavigationRef.current) return false;
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
      setAuthNotification({
        type: 'success',
        message: 'Οι αλλαγές χρήστη και ρόλων αποθηκεύτηκαν.',
      });
      allowProgrammaticNavigationRef.current = true;
      navigate({ to: '/admin/users' });
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
        ? []
        : [role]
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
          <h2 className="font-semibold text-(--color-text-heading)">{firstName || '—'} {lastName || ''}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
                      title="Επιστροφή στη λίστα χρηστών"
                      backgroundColor="var(--color-text-muted)"
                      width="fit-content"
                      onClick={handleBackToList} />
          </div>
        </div>

        <section className="grid w-full content-start gap-10">
          <div className="grid w-full gap-8 mb-10 md:grid-cols-2">
              <div className="md:col-span-2">
                <CustomInputField
                  type="TEXT"
                  label="Ηλεκτρονικό ταχυδρομείο"
                  value={user.email || '—'}
                  disabled
                  width="100%"
                />
              </div>
              <CustomInputField
                type="TEXT"
                label="Όνομα"
                value={firstName}
                onChange={(value) => setFirstName(String(value))}
                width="100%"
              />
              <CustomInputField
                type="TEXT"
                label="Επώνυμο"
                value={lastName}
                onChange={(value) => setLastName(String(value))}
                width="100%"
              />
          </div>

          <div className="grid w-full gap-6 md:grid-cols-2 md:items-start">
            <div className="grid content-start gap-4 w-full max-w-sm md:justify-self-start">
              <div className="w-full text-left text-sm font-medium text-(--color-text-heading)">Ρόλος</div>
              <div className="grid grid-cols-1 gap-4">
                <CustomButton
                  key={currentRoleKey || 'current-role'}
                  title={currentRoleTitle}
                  width="100%"
                  onClick={() => null}
                  disabled={false}
                  backgroundColor="var(--color-dark)"
                  sx={{
                    minHeight: 44,
                    height: '100%',
                    borderRadius: '0.75rem',
                    border: '1px solid transparent',
                    color: '#ffffff',
                    boxShadow: '0 1px 2px rgba(60,40,10,0.08)',
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    whiteSpace: 'normal',
                    paddingInline: '0.75rem',
                    cursor: 'default',
                    pointerEvents: 'none',
                    '&:hover': {
                      backgroundColor: 'var(--color-dark)',
                      filter: 'none',
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid content-start gap-4 w-full max-w-sm md:justify-self-end">
              <div className="w-full text-left text-sm font-medium text-(--color-text-heading)">Κατάσταση</div>
              <div className="grid grid-cols-1 gap-4">
                <CustomButton
                  title="Ενεργός"
                  onClick={() => setIsActive(true)}
                  width="100%"
                  disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
                  backgroundColor={isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)'}
                  sx={{
                    minHeight: 44,
                    height: '100%',
                    borderRadius: '0.75rem',
                    border: isActive ? '1px solid transparent' : '1px solid var(--color-text-muted)',
                    color: isActive ? '#ffffff' : 'var(--color-text)',
                    boxShadow: '0 1px 2px rgba(60,40,10,0.08)',
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    whiteSpace: 'normal',
                    paddingInline: '0.75rem',
                    '&:hover': {
                      backgroundColor: isActive ? 'var(--color-text)' : 'rgba(255,255,255,0.85)',
                      filter: 'none',
                    },
                  }}
                />
                <CustomButton
                  title="Ανενεργός"
                  onClick={() => setIsActive(false)}
                  width="100%"
                  disabled={isSavingUser || isUpdatingRole || isReinitializingPassword}
                  backgroundColor={!isActive ? 'var(--color-dark)' : 'rgba(255,255,255,0.85)'}
                  sx={{
                    minHeight: 44,
                    height: '100%',
                    borderRadius: '0.75rem',
                    border: !isActive ? '1px solid transparent' : '1px solid var(--color-text-muted)',
                    color: !isActive ? '#ffffff' : 'var(--color-text)',
                    boxShadow: '0 1px 2px rgba(60,40,10,0.08)',
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    whiteSpace: 'normal',
                    paddingInline: '0.75rem',
                    '&:hover': {
                      backgroundColor: !isActive ? 'var(--color-text)' : 'rgba(255,255,255,0.85)',
                      filter: 'none',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          {/* <CustomButton
            title={isReinitializingPassword ? 'Επαναρχικοποίηση...' : 'Επαναρχικοποίηση Κωδικού'}
            backgroundColor="var(--color-text-muted)"
            onClick={handleReinitializePassword}
            disabled={isReinitializingPassword}
            width={220}
          /> */}

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