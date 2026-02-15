/**
 * EmptyConnectionsView Component
 *
 * Displays when the user has no connections yet.
 * Shows a friendly message and placeholder action button.
 */
export function EmptyConnectionsView() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-[var(--slate-200)]">
      <div className="text-center max-w-md mx-auto">
        {/* Icon/Illustration */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-[var(--teal)]/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[var(--teal)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-semibold text-[var(--slate-900)] mb-2">
          No connections yet
        </h3>
        <p className="text-[var(--slate-600)] mb-6">
          You haven't added any connections to your Pulse network. Start
          connecting with family and friends to share your daily check-ins.
        </p>

        {/* Action button (placeholder for Unit 3) */}
        <button
          type="button"
          disabled
          className="
            px-6 py-3 rounded-lg
            bg-[var(--slate-200)] text-[var(--slate-500)]
            font-medium
            cursor-not-allowed
            flex items-center gap-2 mx-auto
          "
          title="Coming soon in Unit 3"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Invite someone
        </button>

        <p className="text-[var(--slate-400)] text-xs mt-3">
          Coming soon in Unit 3: Connections
        </p>
      </div>
    </div>
  );
}
