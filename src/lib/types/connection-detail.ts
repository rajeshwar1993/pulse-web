export interface ConnectionStats {
  connectionCreatedAt: string;
  totalDaysConnected: number;
  daysBothPulsed: number;
  syncRate: number;
  sharedStreakCurrent: number;
  sharedStreakLongest: number;
  otherUserId: string;
  otherDisplayName: string;
  otherAvatarUrl: string;
  otherTimezone: string;
  otherCurrentStreak: number;
  otherLongestStreak: number;
  otherLastPulseDate: string | null;
}
