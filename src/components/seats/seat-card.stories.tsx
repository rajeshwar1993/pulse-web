import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import {
  mockSeatExpired,
  mockSeatPending,
  mockSeats,
  mockSeatsEmpty,
} from "@/stories/mock-data";
import { SeatCard } from "./seat-card";

const meta = {
  title: "Seats/SeatCard",
  component: SeatCard,
  tags: ["autodocs"],
} satisfies Meta<typeof SeatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const handlers = {
  onEmptyClick: fn(),
  onPendingClick: fn(),
  onOccupiedClick: fn(),
  onExpiredClick: fn(),
};

export const Empty: Story = {
  args: {
    seat: mockSeatsEmpty[0],
    ...handlers,
  },
};

export const Pending: Story = {
  args: {
    seat: mockSeatPending,
    ...handlers,
  },
};

export const Occupied: Story = {
  args: {
    seat: mockSeats[0],
    ...handlers,
  },
};

export const Expired: Story = {
  args: {
    seat: mockSeatExpired,
    ...handlers,
  },
};
