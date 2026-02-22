import type { Meta, StoryObj } from "@storybook/react";
import type { DashboardConnection } from "@/lib/types/connection";
import { ConnectionGrid } from "./connection-grid";

const meta = {
  title: "Dashboard/ConnectionGrid",
  component: ConnectionGrid,
  tags: ["autodocs"],
  argTypes: {
    connections: {
      control: "object",
      description: "Array of dashboard connections to display in the grid",
    },
  },
} satisfies Meta<typeof ConnectionGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockConnections: DashboardConnection[] = [
  {
    id: "1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    name: "Mom",
    timezone: "America/New_York",
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    currentStreak: 12,
    longestStreak: 15,
  },
  {
    id: "2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dad",
    name: "Dad",
    timezone: "Europe/London",
    status: "waiting",
    currentStreak: 0,
    longestStreak: 3,
  },
  {
    id: "3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sister",
    name: "Sister",
    timezone: "Asia/Tokyo",
    status: "active",
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    currentStreak: 5,
    longestStreak: 5,
  },
  {
    id: "4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma",
    name: "Grandma",
    timezone: "Australia/Sydney",
    status: "waiting",
    currentStreak: 0,
    longestStreak: 0,
  },
];

export const Populated: Story = {
  args: {
    connections: mockConnections,
  },
};

export const SingleConnection: Story = {
  args: {
    connections: [mockConnections[0]],
  },
};

export const Empty: Story = {
  args: {
    connections: [],
  },
};
