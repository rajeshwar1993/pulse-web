import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionCard } from "./connection-card";

const meta = {
  title: "Dashboard/ConnectionCard",
  component: ConnectionCard,
  tags: ["autodocs"],
  argTypes: {
    avatar: {
      control: "text",
      description: "URL of the connection's avatar image",
    },
    name: {
      control: "text",
      description: "Display name of the connection",
    },
    status: {
      control: "select",
      options: ["active", "waiting"],
      description: "Current pulse status of the connection",
    },
    currentStreak: {
      control: { type: "number", min: 0 },
      description: "Current consecutive pulse-day streak",
    },
  },
} satisfies Meta<typeof ConnectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    name: "Mom",
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    currentStreak: 12,
  },
};

export const ActiveNoStreak: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    name: "Mom",
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    currentStreak: 0,
  },
};

export const Waiting: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dad",
    name: "Dad",
    status: "waiting",
    currentStreak: 0,
  },
};

export const LongName: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra",
    name: "Alexandra Konstantinova-Petrovskaya",
    status: "active",
    pulseTime: new Date(Date.now() - 60 * 60 * 1000),
    currentStreak: 5,
  },
};
