import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import {
  mockSeatExpired,
  mockSeatExpiredWithConnection,
} from "@/stories/mock-data";
import { ExpiredSeatCard } from "./expired-seat-card";

const meta = {
  title: "Seats/ExpiredSeatCard",
  component: ExpiredSeatCard,
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      description: "Called when the expired seat card is clicked (to renew)",
    },
  },
} satisfies Meta<typeof ExpiredSeatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    seat: mockSeatExpired,
    onClick: fn(),
  },
};

export const WithPausedConnection: Story = {
  args: {
    seat: mockSeatExpiredWithConnection,
    onClick: fn(),
  },
};
