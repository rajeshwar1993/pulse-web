import type { Meta, StoryObj } from "@storybook/react";
import { StreakBadge } from "./streak-badge";

const meta = {
  title: "Dashboard/StreakBadge",
  component: StreakBadge,
  tags: ["autodocs"],
  argTypes: {
    currentStreak: {
      control: { type: "number", min: 0 },
      description: "Current consecutive pulse-day streak",
    },
    longestStreak: {
      control: { type: "number", min: 0 },
      description: "All-time longest streak",
    },
  },
} satisfies Meta<typeof StreakBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveStreak: Story = {
  args: {
    currentStreak: 7,
    longestStreak: 14,
  },
};

export const LongStreak: Story = {
  args: {
    currentStreak: 42,
    longestStreak: 42,
  },
};

export const SingleDay: Story = {
  args: {
    currentStreak: 1,
    longestStreak: 8,
  },
};

export const NoStreak: Story = {
  args: {
    currentStreak: 0,
    longestStreak: 0,
  },
};

export const BrokenStreak: Story = {
  args: {
    currentStreak: 0,
    longestStreak: 21,
  },
};
