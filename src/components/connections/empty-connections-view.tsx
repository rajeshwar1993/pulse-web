interface EmptyConnectionsViewProps {
  onAddConnection: () => void;
}

export function EmptyConnectionsView({
  onAddConnection,
}: EmptyConnectionsViewProps) {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
          <svg
            className="w-12 h-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        No connections yet
      </h2>
      <p className="text-slate-600 mb-8">
        Add your first connection to start sharing your daily pulse
      </p>
      <button
        onClick={onAddConnection}
        className="bg-teal-300 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
      >
        Add Your First Connection
      </button>
    </div>
  );
}
