import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./heading";

const meta = {
  title: "UI/Heading",
  component: Heading,
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: "select",
      options: ["h1", "h2", "h3"],
      description: "HTML heading level to render",
      table: { defaultValue: { summary: "h2" } },
    },
    size: {
      control: "select",
      options: ["xl", "lg", "md", "base", "sm"],
      description: "Visual size of the heading",
      table: { defaultValue: { summary: "md" } },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExtraLarge: Story = {
  args: {
    as: "h1",
    size: "xl",
    children: "Pulse",
  },
};

export const Large: Story = {
  args: {
    as: "h1",
    size: "lg",
    children: "Good morning, Alex!",
  },
};

export const Medium: Story = {
  args: {
    as: "h2",
    size: "md",
    children: "Settings",
  },
};

export const Base: Story = {
  args: {
    as: "h2",
    size: "base",
    children: "Something went wrong",
  },
};

export const Small: Story = {
  args: {
    as: "h2",
    size: "sm",
    children: "Your Status",
  },
};

export const TealColor: Story = {
  args: {
    as: "h1",
    size: "lg",
    className: "text-[var(--teal)]",
    children: "Set up your profile",
  },
};
