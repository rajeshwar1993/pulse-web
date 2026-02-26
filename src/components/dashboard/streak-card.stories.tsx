import type { Meta, StoryObj } from "@storybook/react";
import { StreakCard } from "./streak-card";

const meta = {
  title: "Dashboard/StreakCard",
  component: StreakCard,
  tags: ["autodocs"],
} satisfies Meta<typeof StreakCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Brand-new user, only 3 days in. Current day at position 3. */
export const NewUser: Story = {
  args: {
    currentStreak: 2,
    isActive: true,
    totalDays: 3,
    todayPulseDay: "2026-02-26",
    pulsedDates: ["2026-02-24", "2026-02-25", "2026-02-26"],
  },
};

/** Active 5-day streak with sliding window (totalDays=15). */
export const ActiveStreak: Story = {
  args: {
    currentStreak: 5,
    isActive: true,
    totalDays: 15,
    todayPulseDay: "2026-02-26",
    pulsedDates: [
      "2026-02-22",
      "2026-02-23",
      "2026-02-24",
      "2026-02-25",
      "2026-02-26",
    ],
  },
};

/** Broken streak — missed yesterday, streak is 0. */
export const BrokenStreak: Story = {
  args: {
    currentStreak: 0,
    isActive: true,
    totalDays: 20,
    todayPulseDay: "2026-02-26",
    pulsedDates: ["2026-02-20", "2026-02-21", "2026-02-23", "2026-02-26"],
  },
};

/** Perfect run — all 9 past days and today pulsed. */
export const PerfectRun: Story = {
  args: {
    currentStreak: 9,
    isActive: true,
    totalDays: 30,
    todayPulseDay: "2026-02-26",
    pulsedDates: [
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21",
      "2026-02-22",
      "2026-02-23",
      "2026-02-24",
      "2026-02-25",
      "2026-02-26",
    ],
  },
};

/** User hasn't pulsed today yet — current dot is empty with pulsing border. */
export const NotYetPulsed: Story = {
  args: {
    currentStreak: 3,
    isActive: false,
    totalDays: 15,
    todayPulseDay: "2026-02-26",
    pulsedDates: ["2026-02-23", "2026-02-24", "2026-02-25"],
  },
};

/** First day ever — 11 future dots with gradual opacity fade from 90% down to 10%. */
export const FirstDay: Story = {
  args: {
    currentStreak: 1,
    isActive: true,
    totalDays: 1,
    todayPulseDay: "2026-02-26",
    pulsedDates: ["2026-02-26"],
  },
};

/** Day 2 — 10 future dots showing the full gradient range. */
export const SecondDay: Story = {
  args: {
    currentStreak: 2,
    isActive: true,
    totalDays: 2,
    todayPulseDay: "2026-02-26",
    pulsedDates: ["2026-02-25", "2026-02-26"],
  },
};

/** First day, hasn't pulsed yet — empty current dot + 11 grey future dots. */
export const FirstDayNotPulsed: Story = {
  args: {
    currentStreak: 0,
    isActive: false,
    totalDays: 1,
    todayPulseDay: "2026-02-26",
    pulsedDates: [],
  },
};
