import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Spinner size",
      table: { defaultValue: { summary: "md" } },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { size: "sm" },
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const FullPage: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-[200px] bg-[var(--off-white)] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
  args: { size: "lg" },
};
