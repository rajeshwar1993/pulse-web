import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorAlert: Story = {
  args: {
    variant: "error",
    children: "Failed to create profile. Please try again.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Your session will expire in 5 minutes.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "Your pulse was sent automatically this morning.",
  },
};
