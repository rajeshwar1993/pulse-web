import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Toast } from "./toast";

const meta = {
  title: "UI/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    onDismiss: fn(),
    duration: 60000, // long duration so it doesn't auto-dismiss in Storybook
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    message: "Profile updated successfully!",
    variant: "success",
  },
};

export const ErrorVariant: Story = {
  args: {
    message: "Failed to save changes.",
    variant: "error",
  },
};

export const Info: Story = {
  args: {
    message: "Your pulse was sent automatically.",
    variant: "info",
  },
};
