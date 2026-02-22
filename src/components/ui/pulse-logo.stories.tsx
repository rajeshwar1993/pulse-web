import type { Meta, StoryObj } from "@storybook/react";
import { PulseLogo } from "./pulse-logo";

const meta = {
  title: "UI/PulseLogo",
  component: PulseLogo,
  tags: ["autodocs"],
} satisfies Meta<typeof PulseLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-16 h-16",
  },
};

export const Small: Story = {
  args: {
    className: "w-8 h-8",
  },
};

export const Large: Story = {
  args: {
    className: "w-24 h-24",
  },
};
