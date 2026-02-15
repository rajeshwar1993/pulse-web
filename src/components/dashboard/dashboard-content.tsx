'use client';

import { useEffect, useState } from 'react';
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

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header with dynamic greeting */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--slate-900)]">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="text-[var(--slate-600)] mt-1">
          {isActive
            ? "You're all set for today. Check on your connections below."
            : "Welcome back! Here's your dashboard."}
        </p>
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
