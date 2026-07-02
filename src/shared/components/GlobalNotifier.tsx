import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type NotificationDetail = { type: 'success' | 'error' | 'warning' | 'info'; message: string };

export default function GlobalNotifier() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  useEffect(() => {
    function handler(e: Event) {
      const custom = e as CustomEvent<NotificationDetail>;
      if (!custom?.detail) return;
      setMessage(custom.detail.message || '');
      setSeverity(custom.detail.type || 'info');
      setOpen(true);
    }

    window.addEventListener('app-notification', handler as EventListener);
    return () => window.removeEventListener('app-notification', handler as EventListener);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={() => setOpen(false)} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
