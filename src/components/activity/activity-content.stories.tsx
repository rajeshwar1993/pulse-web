import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import {
  mockPulsedDatesEmpty,
  mockPulsedDatesScattered,
  mockPulsedDatesStreak,
} from "@/stories/mock-data";
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
    pulsedDates: mockPulsedDatesStreak,
    memberSince: "2025-06-15T10:30:00Z",
    totalPulses: 142,
  },
  play: async ({ canvas, step }) => {
    await step("Verify title is visible", async () => {
      await expect(canvas.getByText("Activity")).toBeVisible();
    });

    await step("Verify streak badge", async () => {
      await expect(canvas.getByText("14")).toBeVisible();
    });

    await step("Verify stats", async () => {
      await expect(canvas.getByText("142")).toBeVisible();
      await expect(canvas.getByText("Member Since")).toBeVisible();
      await expect(canvas.getByText("Total Pulses")).toBeVisible();
    });
  },
};

export const ScatteredActivity: Story = {
  args: {
    currentStreak: 3,
    longestStreak: 14,
    pulsedDates: mockPulsedDatesScattered,
    memberSince: "2025-01-01T00:00:00Z",
    totalPulses: 87,
  },
};

export const NoStreak: Story = {
  args: {
    currentStreak: 0,
    longestStreak: 7,
    pulsedDates: mockPulsedDatesEmpty,
    memberSince: "2026-02-01T00:00:00Z",
    totalPulses: 12,
  },
};

export const NewUser: Story = {
  args: {
    currentStreak: 1,
    longestStreak: 1,
    pulsedDates: [new Date().toISOString().slice(0, 10)],
    memberSince: new Date().toISOString(),
    totalPulses: 1,
  },
};
