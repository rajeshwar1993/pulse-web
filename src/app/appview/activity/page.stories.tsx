import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { ActivityContent } from "@/components/activity/activity-content";
import {
  mockCalendarScattered,
  mockCalendarStreak,
} from "@/stories/mock-data";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const meta = {
  title: "Pages/AppView/Activity",
  component: ActivityContent,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile" },
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

export const Active: Story = {
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

    await step("Verify streak is displayed", async () => {
      await expect(canvas.getAllByText("14").length).toBeGreaterThanOrEqual(1);
    });

    await step("Verify pulse rate", async () => {
      await expect(canvas.getByText("Pulse Rate")).toBeVisible();
      await expect(canvas.getByTestId("pulse-rate")).toBeVisible();
    });

    await step("Verify calendar legend", async () => {
      await expect(canvas.getByTestId("calendar-legend")).toBeVisible();
    });

    await step("Verify milestone badges", async () => {
      await expect(canvas.getByTestId("milestone-badges")).toBeVisible();
    });
  },
};

export const Inactive: Story = {
  args: {
    currentStreak: 0,
    longestStreak: 7,
    pulsedDates: mockCalendarScattered,
    memberSince: "2025-01-01T00:00:00Z",
    totalPulses: 45,
    todayPulseDay: todayStr(),
  },
};
