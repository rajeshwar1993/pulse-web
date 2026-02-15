'use client';

import { useEffect, useState } from 'react';
import { ConnectionService } from '@/lib/services/connection-service';
import type { ConnectionWithProfile } from '@/lib/types/connection';
import { ConnectionGrid } from '@/components/connections/connection-grid';
import { EmptyConnectionsView } from '@/components/connections/empty-connections-view';
import { InviteModal } from '@/components/connections/invite-modal';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const data = await ConnectionService.getActiveConnections();
      setConnections(data);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm('Remove this connection? You can restore it within 30 days.')) {
      return;
    }

    try {
      await ConnectionService.removeConnection(connectionId);
      await loadConnections();
    } catch (error) {
      console.error('Failed to remove connection:', error);
      alert('Failed to remove connection');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offWhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offWhite p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-300 mb-2">
              Connections
            </h1>
            <p className="text-slate-600">
              {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-teal-300 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
          >
            + Add Connection
          </button>
        </div>

        {/* Content */}
        {connections.length === 0 ? (
          <EmptyConnectionsView onAddConnection={() => setShowInviteModal(true)} />
        ) : (
          <ConnectionGrid
            connections={connections}
            onRemoveConnection={handleRemoveConnection}
          />
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <InviteModal onClose={() => setShowInviteModal(false)} />
        )}
      </div>
    </div>
  );
}
