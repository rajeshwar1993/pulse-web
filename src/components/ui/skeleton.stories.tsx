import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    rounded: {
      control: "select",
      options: ["sm", "md", "full"],
      description: "Border radius style",
      table: { defaultValue: { summary: "md" } },
    },
    className: {
      control: "text",
      description: "Additional CSS classes for width and height",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLine: Story = {
  args: {
    className: "h-5 w-64",
    rounded: "sm",
  },
};

export const Circle: Story = {
  args: {
    className: "w-12 h-12",
    rounded: "full",
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--slate-200)] space-y-4">
      <Skeleton className="h-5 w-24" rounded="sm" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded="full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" rounded="sm" />
          <Skeleton className="h-4 w-28" rounded="sm" />
        </div>
      </div>
    </div>
  ),
};

export const GridSkeleton: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 border border-[var(--slate-200)]"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-20" rounded="sm" />
              <Skeleton className="h-4 w-16" rounded="sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
