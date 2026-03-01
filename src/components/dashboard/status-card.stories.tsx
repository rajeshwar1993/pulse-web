import type { Meta, StoryObj } from "@storybook/react";
import { StatusCard } from "./status-card";

const meta = {
  title: "Dashboard/StatusCard",
  component: StatusCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-[var(--off-white)] p-6 max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isActive: {
      control: "boolean",
      description: "Whether the user has an active pulse today",
    },
    pulseTime: {
      control: "date",
      description: "The timestamp when the user pulsed",
    },
  },
} satisfies Meta<typeof StatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    isActive: true,
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
};

export const ActiveJustNow: Story = {
  args: {
    isActive: true,
    pulseTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
};

export const Inactive: Story = {
  args: {
    isActive: false,
  },
};
