'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ConnectionService } from '@/lib/services/connection-service';
import type { ConnectionWithProfile } from '@/lib/types/connection';
import { ConnectionGrid } from '@/components/connections/connection-grid';
import { EmptyConnectionsView } from '@/components/connections/empty-connections-view';
import { InviteModal } from '@/components/connections/invite-modal';

export default function ConnectionsPage() {
  const t = useTranslations('connections');
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
    if (!confirm(t('removeConfirm'))) {
      return;
    }

    try {
      await ConnectionService.removeConnection(connectionId);
      await loadConnections();
    } catch (error) {
      console.error('Failed to remove connection:', error);
      alert(t('removeError'));
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
              {t('title')}
            </h1>
            <p className="text-slate-600">
              {t('connectionCount', { count: connections.length })}
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-teal-300 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
          >
            {t('addConnection')}
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
