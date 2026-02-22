import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./status-dot";

const meta = {
  title: "UI/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    status: "active",
  },
};

export const ActiveWithPing: Story = {
  args: {
    status: "active",
    ping: true,
  },
};

export const Inactive: Story = {
  args: {
    status: "inactive",
  },
};
