import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import {
  mockPulsedDatesEmpty,
  mockPulsedDatesScattered,
  mockPulsedDatesStreak,
} from "@/stories/mock-data";
import { GhostCalendar } from "./ghost-calendar";

/** Generate all 30 dates (today backwards). */
function allDates(): string[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
}

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
  },
} satisfies Meta<typeof GhostCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Most days pulsed with a few gaps — typical active user. */
export const Scattered: Story = {
  args: {
    pulsedDates: mockPulsedDatesScattered,
  },
  play: async ({ canvas, step }) => {
    await step("Renders filled and ghost dots", async () => {
      const filled = canvas.getAllByTestId("dot-filled");
      const ghost = canvas.getAllByTestId("dot-ghost");
      await expect(filled.length).toBeGreaterThan(0);
      await expect(ghost.length).toBeGreaterThan(0);
    });
  },
};

/** Last 14 consecutive days pulsed — streak pattern. */
export const Streak: Story = {
  args: {
    pulsedDates: mockPulsedDatesStreak,
  },
};

/** No pulses at all — brand new or lapsed user. */
export const Empty: Story = {
  args: {
    pulsedDates: mockPulsedDatesEmpty,
  },
  play: async ({ canvas, step }) => {
    await step("All dots are ghost dots", async () => {
      const ghost = canvas.getAllByTestId("dot-ghost");
      await expect(ghost.length).toBe(30);
      await expect(canvas.queryAllByTestId("dot-filled").length).toBe(0);
    });
  },
};

/** Every single day pulsed — perfect record. */
export const PerfectMonth: Story = {
  args: {
    pulsedDates: allDates(),
  },
  play: async ({ canvas, step }) => {
    await step("All dots are filled", async () => {
      const filled = canvas.getAllByTestId("dot-filled");
      await expect(filled.length).toBe(30);
      await expect(canvas.queryAllByTestId("dot-ghost").length).toBe(0);
    });
  },
};
