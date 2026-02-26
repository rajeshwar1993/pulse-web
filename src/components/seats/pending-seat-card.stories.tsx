import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { mockSeatPending, mockSeatPendingRequest } from "@/stories/mock-data";
import { PendingSeatCard } from "./pending-seat-card";

const meta = {
  title: "Seats/PendingSeatCard",
  component: PendingSeatCard,
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      description: "Called when the pending seat card is clicked (to cancel)",
    },
  },
} satisfies Meta<typeof PendingSeatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InviteCode: Story = {
  args: {
    seat: mockSeatPending,
    onClick: fn(),
  },
};

export const ConnectionRequest: Story = {
  args: {
    seat: mockSeatPendingRequest,
    onClick: fn(),
  },
};
