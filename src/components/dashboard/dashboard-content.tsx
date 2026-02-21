'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { WisdomCard } from './wisdom-card';
import { StatusCard } from './status-card';
import { ConnectionGrid, type Connection } from './connection-grid';
import { EmptyConnectionsView } from './empty-connections-view';

interface DashboardContentProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  connections: Connection[];
  showWisdom?: boolean;
}

/**
 * DashboardContent Component
 *
 * Client-side wrapper for the Dashboard page.
 * Handles:
 * - window.isReady signal to Flutter
 * - Interactive components (WisdomCard)
 * - Dynamic greeting based on time of day
 */
export function DashboardContent({
  displayName,
  isActive,
  pulseTime,
  connections,
  showWisdom = true,
}: DashboardContentProps) {
  const t = useTranslations('dashboard');
  const [showWisdomCard, setShowWisdomCard] = useState(showWisdom);

  // Send window.isReady signal to Flutter WebView
  useEffect(() => {
    // Wait for DOM to be fully ready
    const sendReadySignal = () => {
      try {
        // Check if running in Flutter WebView (FlutterBridge channel)
        if (typeof window !== 'undefined' && (window as any).FlutterBridge) {
          console.log('Sending ready signal to Flutter...');

          // Send JSON message
          (window as any).FlutterBridge.postMessage(
            JSON.stringify({
              type: 'ready',
              timestamp: Date.now(),
            })
          );

          console.log('Ready signal sent successfully');
        } else {
          console.log('FlutterBridge not available (probably running in browser)');
        }
      } catch (error) {
        console.error('Failed to send ready signal:', error);
      }
    };

    // Send signal after a brief delay to ensure everything is loaded
    const timer = setTimeout(sendReadySignal, 500);

    return () => clearTimeout(timer);
  }, []);

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) return t('greetingMorning');
    if (hour < 18) return t('greetingAfternoon');
    return t('greetingEvening');
  };

  return (
    <div className="space-y-6">
      {/* Header with dynamic greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--slate-900)]">
            {getGreeting()}, {displayName}!
          </h1>
          <p className="text-[var(--slate-600)] mt-1">
            {isActive
              ? t('activeSubtitle')
              : t('inactiveSubtitle')}
          </p>
        </div>
        <Link
          href="/settings"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--slate-100)] transition-colors shrink-0"
          aria-label="Settings"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--slate-500)]"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      </div>

      {/* Wisdom Card (conditional) */}
      {showWisdomCard && (
        <WisdomCard
          autoDismiss={true}
          dismissDelay={3000}
          onDismiss={() => setShowWisdomCard(false)}
        />
      )}

      {/* Status Card */}
      <StatusCard isActive={isActive} pulseTime={pulseTime} />

      {/* Connections Section */}
      <div>
        {connections.length > 0 ? (
          <ConnectionGrid connections={connections} />
        ) : (
          <EmptyConnectionsView />
        )}
      </div>
    </div>
  );
}
