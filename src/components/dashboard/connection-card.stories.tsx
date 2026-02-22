import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionCard } from "./connection-card";

const meta = {
  title: "Dashboard/ConnectionCard",
  component: ConnectionCard,
  tags: ["autodocs"],
} satisfies Meta<typeof ConnectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    name: "Mom",
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
};

export const Waiting: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dad",
    name: "Dad",
    status: "waiting",
  },
};

export const LongName: Story = {
  args: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra",
    name: "Alexandra Konstantinova-Petrovskaya",
    status: "active",
    pulseTime: new Date(Date.now() - 60 * 60 * 1000),
  },
};
