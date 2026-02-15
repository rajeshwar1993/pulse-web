import { formatDistanceToNow } from 'date-fns';

interface StatusCardProps {
  /**
   * Whether the user is active today (has pulsed)
   */
  isActive: boolean;
  /**
   * The timestamp when the user pulsed (if active)
   */
  pulseTime?: Date | null;
}

/**
 * StatusCard Component
 *
 * Displays the user's pulse status for the current day.
 * Shows either:
 * - Active state: Green indicator with pulse time
 * - Inactive state: Grey indicator with "not pulsed yet" message
 */
export function StatusCard({ isActive, pulseTime }: StatusCardProps) {
  // Format the pulse time for display
  const formattedTime = pulseTime
    ? formatDistanceToNow(pulseTime, { addSuffix: true })
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--slate-200)]">
      <h2 className="text-lg font-semibold text-[var(--slate-900)] mb-4">
        Your Status
      </h2>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative flex items-center justify-center">
          {isActive ? (
            // Active indicator with pulse animation
            <>
              <div className="absolute w-12 h-12 rounded-full bg-[var(--green)]/20 animate-ping" />
              <div className="relative w-10 h-10 rounded-full bg-[var(--green)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </>
          ) : (
            // Inactive indicator
            <div className="w-10 h-10 rounded-full bg-[var(--slate-300)] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[var(--slate-500)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Status text */}
        <div>
          {isActive ? (
            <>
              <p className="text-[var(--slate-900)] font-semibold">
                You are active today
              </p>
              {formattedTime && (
                <p className="text-[var(--slate-600)] text-sm">
                  Pulsed {formattedTime}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[var(--slate-700)] font-semibold">
                You haven't pulsed yet today
              </p>
              <p className="text-[var(--slate-500)] text-sm">
                Your pulse was sent automatically
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
