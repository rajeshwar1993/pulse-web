import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    alt: "Mom",
  },
};

export const ActiveStatus: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    alt: "Mom",
    status: "active",
  },
};

export const InactiveStatus: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dad",
    alt: "Dad",
    status: "inactive",
  },
};

export const Small: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sister",
    alt: "Sister",
    size: "sm",
    status: "active",
  },
};

export const Large: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma",
    alt: "Grandma",
    size: "lg",
    status: "active",
  },
};
