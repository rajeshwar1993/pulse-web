import { formatDistanceToNow } from 'date-fns';

interface ConnectionCardProps {
  /**
   * Avatar URL for the connection
   */
  avatar: string;
  /**
   * Display name of the connection
   */
  name: string;
  /**
   * Status of the connection (active = pulsed today, waiting = hasn't pulsed yet)
   */
  status: 'active' | 'waiting';
  /**
   * The timestamp when the connection pulsed (if active)
   */
  pulseTime?: Date | null;
}

/**
 * ConnectionCard Component
 *
 * Displays a single connection with their pulse status.
 * Variants:
 * - Active: Full opacity, colored ring, shows pulse time
 * - Waiting: Lower opacity, desaturated, shows "Waiting..." message
 */
export function ConnectionCard({
  avatar,
  name,
  status,
  pulseTime,
}: ConnectionCardProps) {
  const isActive = status === 'active';

  // Format the pulse time for display
  const formattedTime = pulseTime && isActive
    ? formatDistanceToNow(pulseTime, { addSuffix: true })
    : null;

  return (
    <div
      className={`
        relative bg-white rounded-xl p-4 border
        transition-all duration-200 hover:shadow-md
        ${isActive
          ? 'border-[var(--teal)]/30 shadow-sm'
          : 'border-[var(--slate-200)] opacity-70'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with status ring */}
        <div className="relative flex-shrink-0">
          {isActive && (
            // Active pulse ring animation
            <div className="absolute inset-0 rounded-full bg-[var(--teal)]/20 animate-ping" />
          )}
          <img
            src={avatar}
            alt={name}
            className={`
              relative w-12 h-12 rounded-full object-cover
              ring-2
              ${isActive
                ? 'ring-[var(--teal)]'
                : 'ring-[var(--slate-300)] grayscale-[30%]'
              }
            `}
          />
          {/* Status dot */}
          <div
            className={`
              absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white
              ${isActive ? 'bg-[var(--green)]' : 'bg-[var(--slate-400)]'}
            `}
          />
        </div>

        {/* Connection info */}
        <div className="flex-1 min-w-0">
          <p
            className={`
              font-semibold truncate
              ${isActive ? 'text-[var(--slate-900)]' : 'text-[var(--slate-600)]'}
            `}
          >
            {name}
          </p>
          <p
            className={`
              text-sm truncate
              ${isActive ? 'text-[var(--slate-600)]' : 'text-[var(--slate-500)]'}
            `}
          >
            {isActive ? (
              <>
                <span className="text-[var(--green)] font-medium">Active</span>
                {formattedTime && (
                  <>
                    {' '}
                    • <span className="text-[var(--slate-500)]">{formattedTime}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[var(--slate-500)]">Waiting...</span>
            )}
          </p>
        </div>

        {/* Status icon */}
        {isActive ? (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[var(--green)]"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--slate-200)] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[var(--slate-400)]"
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
    </div>
  );
}
