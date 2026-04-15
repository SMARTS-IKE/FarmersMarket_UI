import { useLoadingStore } from '../store/loadingStore';

export default function BlockUI() {
  const isBlocked = useLoadingStore((s) => s.isBlocked);

  if (!isBlocked) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-4 bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-lg px-10 py-8">
        <Spinner />
        <p className="text-sm font-medium text-(--color-text-muted)">Παρακαλώ περιμένετε…</p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="w-10 h-10 animate-spin text-(--color-primary)"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
