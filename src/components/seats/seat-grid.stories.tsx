import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import {
  mockSeats,
  mockSeatsEmpty,
  mockSeatsMixed,
} from "@/stories/mock-data";
import { SeatGrid } from "./seat-grid";

const meta = {
  title: "Seats/SeatGrid",
  component: SeatGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SeatGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const handlers = {
  onEmptyClick: fn(),
  onPendingClick: fn(),
  onOccupiedClick: fn(),
  onExpiredClick: fn(),
};

export const AllOccupied: Story = {
  args: {
    seats: mockSeats,
    ...handlers,
  },
};

export const AllEmpty: Story = {
  args: {
    seats: mockSeatsEmpty,
    ...handlers,
  },
};

export const Mixed: Story = {
  args: {
    seats: mockSeatsMixed,
    ...handlers,
  },
};
