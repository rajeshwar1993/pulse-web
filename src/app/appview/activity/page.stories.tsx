import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { ActivityContent } from "@/components/activity/activity-content";
import {
  mockPulsedDatesScattered,
  mockPulsedDatesStreak,
} from "@/stories/mock-data";

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
    pulsedDates: mockPulsedDatesStreak,
    memberSince: "2025-06-15T10:30:00Z",
    totalPulses: 142,
  },
  play: async ({ canvas, step }) => {
    await step("Verify title is visible", async () => {
      await expect(canvas.getByText("Activity")).toBeVisible();
    });

    await step("Verify streak is displayed", async () => {
      await expect(canvas.getByText("14")).toBeVisible();
    });
  },
};

export const Inactive: Story = {
  args: {
    currentStreak: 0,
    longestStreak: 7,
    pulsedDates: mockPulsedDatesScattered,
    memberSince: "2025-01-01T00:00:00Z",
    totalPulses: 45,
  },
};
