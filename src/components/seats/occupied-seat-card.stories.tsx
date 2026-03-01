import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { mockSeats, mockSeatOccupiedPaused } from "@/stories/mock-data";
import { OccupiedSeatCard } from "./occupied-seat-card";

const meta = {
  title: "Seats/OccupiedSeatCard",
  component: OccupiedSeatCard,
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      description: "Called when the occupied seat card is clicked",
    },
  },
} satisfies Meta<typeof OccupiedSeatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    seat: mockSeats[0],
    onClick: fn(),
  },
};

export const Waiting: Story = {
  args: {
    seat: mockSeats[1],
    onClick: fn(),
  },
};

export const WithStreak: Story = {
  args: {
    seat: mockSeats[2],
    onClick: fn(),
  },
};

export const Paused: Story = {
  args: {
    seat: mockSeatOccupiedPaused,
    onClick: fn(),
  },
};
