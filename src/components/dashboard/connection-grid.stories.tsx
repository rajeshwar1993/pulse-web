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
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dad",
    name: "Dad",
    status: "waiting",
  },
  {
    id: "3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sister",
    name: "Sister",
    status: "active",
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma",
    name: "Grandma",
    status: "waiting",
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
