"use client";

export default function AppViewError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--rose-100)] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--rose-500)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--slate-900)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--slate-600)] mb-6">
          Please try again or restart the app.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-[var(--teal)] text-white rounded-lg font-medium hover:bg-[var(--teal-400)] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
