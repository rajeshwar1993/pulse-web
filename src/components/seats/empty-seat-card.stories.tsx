import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { EmptySeatCard } from "./empty-seat-card";

const meta = {
  title: "Seats/EmptySeatCard",
  component: EmptySeatCard,
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      description: "Called when the empty seat card is clicked",
    },
  },
} satisfies Meta<typeof EmptySeatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: fn(),
  },
};
