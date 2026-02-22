import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Continue",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Cancel",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Remove Connection",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Back",
  },
};

export const Small: Story = {
  args: {
    variant: "primary",
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    variant: "primary",
    size: "lg",
    children: "Submit Profile",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    size: "lg",
    loading: true,
    children: "Creating...",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: "Disabled",
  },
};
