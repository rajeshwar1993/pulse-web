import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { ConnectionWithProfile } from "@/lib/types/connection";
import { ConnectionCard } from "./connection-card";

const meta = {
  title: "Connections/ConnectionCard",
  component: ConnectionCard,
  tags: ["autodocs"],
  args: {
    onRemove: fn(),
  },
} satisfies Meta<typeof ConnectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseConnection: ConnectionWithProfile = {
  id: "conn-1",
  user_id: "user-002",
  display_name: "Mom",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
  timezone: "America/New_York",
  status: "active",
  last_pulse: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  created_at: "2025-01-01T00:00:00Z",
  current_streak: 12,
  longest_streak: 20,
};

export const ActiveWithStreak: Story = {
  args: {
    connection: baseConnection,
  },
};

export const ActiveNoStreak: Story = {
  args: {
    connection: {
      ...baseConnection,
      current_streak: 0,
      longest_streak: 3,
    },
  },
};

export const Waiting: Story = {
  args: {
    connection: {
      ...baseConnection,
      id: "conn-2",
      display_name: "Dad",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dad",
      status: "waiting",
      last_pulse: undefined,
      current_streak: 0,
      longest_streak: 0,
    },
  },
};

export const HighStreak: Story = {
  args: {
    connection: {
      ...baseConnection,
      display_name: "Sister",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sister",
      current_streak: 42,
      longest_streak: 42,
    },
  },
};
