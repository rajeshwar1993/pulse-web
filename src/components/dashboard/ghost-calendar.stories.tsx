import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import {
  mockCalendarEmpty,
  mockCalendarPerfect,
  mockCalendarScattered,
  mockCalendarStreak,
} from "@/stories/mock-data";
import { GhostCalendar } from "./ghost-calendar";

const meta = {
  title: "Dashboard/GhostCalendar",
  component: GhostCalendar,
  tags: ["autodocs"],
  argTypes: {
    pulsedDates: {
      control: "object",
      description:
        "Array of YYYY-MM-DD date strings representing days the user pulsed",
    },
    memberSince: {
      control: "text",
      description: "ISO timestamp of when the user joined",
    },
    todayPulseDay: {
      control: "text",
      description:
        "YYYY-MM-DD override for today's pulse day (falls back to getTodayPulseDay())",
    },
  },
} satisfies Meta<typeof GhostCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default memberSince — long-time user. */
const defaultMemberSince = "2025-01-01T00:00:00Z";

/** Most days pulsed with a few gaps — typical active user. */
export const Scattered: Story = {
  args: {
    pulsedDates: mockCalendarScattered,
    memberSince: defaultMemberSince,
  },
  play: async ({ canvas, step }) => {
    await step("Renders filled and missed dots", async () => {
      const filled = canvas.getAllByTestId("dot-filled");
      await expect(filled.length).toBeGreaterThan(0);
    });
    await step("Renders month title", async () => {
      const title = canvas.getByTestId("month-title");
      await expect(title).toBeTruthy();
    });
  },
};

/** Last 10 consecutive days pulsed — streak pattern. */
export const Streak: Story = {
  args: {
    pulsedDates: mockCalendarStreak,
    memberSince: defaultMemberSince,
  },
};

/** No pulses at all — brand new or lapsed user. */
export const Empty: Story = {
  args: {
    pulsedDates: mockCalendarEmpty,
    memberSince: defaultMemberSince,
  },
  play: async ({ canvas, step }) => {
    await step("All past dots are missed", async () => {
      await expect(canvas.queryAllByTestId("dot-filled").length).toBe(0);
    });
  },
};

/** Every single day pulsed — perfect record. */
export const PerfectMonth: Story = {
  args: {
    pulsedDates: mockCalendarPerfect,
    memberSince: defaultMemberSince,
  },
  play: async ({ canvas, step }) => {
    await step("All past days are filled", async () => {
      const filled = canvas.getAllByTestId("dot-filled");
      await expect(filled.length).toBeGreaterThan(0);
      await expect(canvas.queryAllByTestId("dot-missed").length).toBe(0);
    });
  },
};

/** User who joined very recently — only a few days of data. */
export const NewUser: Story = {
  args: {
    pulsedDates: (() => {
      const today = new Date();
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      // Joined 3 days ago, pulsed first 2 days
      return [
        fmt(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        ),
        fmt(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        ),
      ];
    })(),
    memberSince: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return d.toISOString();
    })(),
  },
};

/** User who joined this month — pre-join days are neutral. */
export const JoinedThisMonth: Story = {
  args: {
    pulsedDates: (() => {
      const today = new Date();
      const joinDay = 10;
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dates: string[] = [];
      for (let day = joinDay; day <= today.getDate(); day++) {
        if (day % 2 === 0) {
          dates.push(fmt(new Date(today.getFullYear(), today.getMonth(), day)));
        }
      }
      return dates;
    })(),
    memberSince: (() => {
      const d = new Date();
      d.setDate(10);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    })(),
  },
};
