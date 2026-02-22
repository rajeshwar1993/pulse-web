import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h2 className="text-lg font-semibold text-[var(--slate-900)] mb-2">
          Card Title
        </h2>
        <p className="text-[var(--slate-600)]">
          This is a standard card with default medium padding.
        </p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: "sm",
    children: (
      <p className="text-[var(--slate-600)]">Card with small padding (p-4).</p>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: "lg",
    children: (
      <p className="text-[var(--slate-600)]">Card with large padding (p-8).</p>
    ),
  },
};

export const Hoverable: Story = {
  args: {
    hover: true,
    children: (
      <p className="text-[var(--slate-600)]">
        Hover over me for elevated shadow.
      </p>
    ),
  },
};
