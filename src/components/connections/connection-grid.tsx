import type { ConnectionWithProfile } from '@/lib/types/connection';
import { ConnectionCard } from './connection-card';

interface ConnectionGridProps {
  connections: ConnectionWithProfile[];
  onRemoveConnection: (id: string) => void;
}

export function ConnectionGrid({
  connections,
  onRemoveConnection,
}: ConnectionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onRemove={onRemoveConnection}
        />
      ))}
    </div>
  );
}
