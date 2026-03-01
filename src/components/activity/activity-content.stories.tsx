import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import {
  mockCalendarEmpty,
  mockCalendarPerfect,
  mockCalendarScattered,
  mockCalendarStreak,
} from "@/stories/mock-data";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
import { ActivityContent } from "./activity-content";

const meta = {
  title: "Components/Activity/ActivityContent",
  component: ActivityContent,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[var(--off-white)] p-6">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithStreak: Story = {
  args: {
    currentStreak: 14,
    longestStreak: 21,
    pulsedDates: mockCalendarStreak,
    memberSince: "2025-06-15T10:30:00Z",
    totalPulses: 142,
    todayPulseDay: todayStr(),
  },
  play: async ({ canvas, step }) => {
    await step("Verify title is visible", async () => {
      await expect(canvas.getByText("Activity")).toBeVisible();
    });

    await step("Verify streak badge", async () => {
      await expect(canvas.getAllByText("14").length).toBeGreaterThanOrEqual(1);
    });

    await step("Verify stats", async () => {
      await expect(canvas.getByText("142")).toBeVisible();
      await expect(canvas.getByText("Member Since")).toBeVisible();
      await expect(canvas.getAllByText("Total Pulses").length).toBeGreaterThanOrEqual(1);
    });

    await step("Verify pulse rate is visible", async () => {
      await expect(canvas.getByText("Pulse Rate")).toBeVisible();
      await expect(canvas.getByTestId("pulse-rate")).toBeVisible();
    });

    await step("Verify calendar legend is visible", async () => {
      await expect(canvas.getByTestId("calendar-legend")).toBeVisible();
      await expect(canvas.getByText("Pulsed")).toBeVisible();
      await expect(canvas.getByText("Missed")).toBeVisible();
    });

    await step("Verify milestone badges are visible", async () => {
      await expect(canvas.getByTestId("milestone-badges")).toBeVisible();
      await expect(canvas.getByText("Milestones")).toBeVisible();
    });
  },
};

export const ScatteredActivity: Story = {
  args: {
    currentStreak: 3,
    longestStreak: 14,
    pulsedDates: mockCalendarScattered,
    memberSince: "2025-01-01T00:00:00Z",
    totalPulses: 87,
    todayPulseDay: todayStr(),
  },
};

export const NoStreak: Story = {
  args: {
    currentStreak: 0,
    longestStreak: 7,
    pulsedDates: mockCalendarEmpty,
    memberSince: "2026-02-01T00:00:00Z",
    totalPulses: 12,
    todayPulseDay: todayStr(),
  },
};

export const NewUser: Story = {
  args: {
    currentStreak: 1,
    longestStreak: 1,
    pulsedDates: [todayStr()],
    memberSince: new Date().toISOString(),
    totalPulses: 1,
    todayPulseDay: todayStr(),
  },
};

export const HighAchiever: Story = {
  args: {
    currentStreak: 100,
    longestStreak: 100,
    pulsedDates: mockCalendarPerfect,
    memberSince: "2025-01-01T00:00:00Z",
    totalPulses: 365,
    todayPulseDay: todayStr(),
  },
  play: async ({ canvas, step }) => {
    await step("Verify all pulse milestones earned", async () => {
      await expect(canvas.getByTestId("pulse-milestone-7")).toBeVisible();
      await expect(canvas.getByTestId("pulse-milestone-365")).toBeVisible();
    });

    await step("Verify all streak milestones earned", async () => {
      await expect(canvas.getByTestId("streak-milestone-7")).toBeVisible();
      await expect(canvas.getByTestId("streak-milestone-100")).toBeVisible();
    });

    await step("Verify pulse rate displayed", async () => {
      await expect(canvas.getByTestId("pulse-rate")).toBeVisible();
    });
  },
};
