import type { ConnectionWithProfile } from '@/lib/types/connection';

interface ConnectionCardProps {
  connection: ConnectionWithProfile;
  onRemove: (id: string) => void;
}

export function ConnectionCard({ connection, onRemove }: ConnectionCardProps) {
  const statusColor =
    connection.status === 'active' ? 'bg-green-500' : 'bg-slate-300';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      {/* Avatar and Status */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <img
            src={connection.avatar_url}
            alt={connection.display_name}
            className="w-16 h-16 rounded-full"
          />
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 ${statusColor} rounded-full border-2 border-white`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {connection.display_name}
          </h3>
          <p className="text-sm text-slate-500">
            {connection.status === 'active' ? 'Active today' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onRemove(connection.id)}
        className="w-full text-sm text-red-600 hover:text-red-700 py-2"
      >
        Remove Connection
      </button>
    </div>
  );
}
