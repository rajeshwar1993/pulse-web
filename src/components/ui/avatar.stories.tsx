import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "Image source URL for the avatar",
    },
    alt: {
      control: "text",
      description: "Alt text for the avatar image",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Avatar size",
      table: { defaultValue: { summary: "md" } },
    },
    status: {
      control: "select",
      options: ["active", "inactive", "none"],
      description: "Status indicator displayed on the avatar",
      table: { defaultValue: { summary: "none" } },
    },
  },
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
