import type { Meta, StoryObj } from "@storybook/react";
import { IconBadge } from "./icon-badge";

const meta = {
  title: "UI/IconBadge",
  component: IconBadge,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Badge size",
      table: { defaultValue: { summary: "md" } },
    },
    color: {
      control: "select",
      options: ["teal", "rose", "green", "slate"],
      description: "Badge background color",
      table: { defaultValue: { summary: "teal" } },
    },
  },
} satisfies Meta<typeof IconBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TealMedium: Story = {
  args: {
    color: "teal",
    size: "md",
    children: (
      <svg
        className="w-8 h-8 text-[var(--teal)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
};

export const RoseLarge: Story = {
  args: {
    color: "rose",
    size: "lg",
    children: (
      <svg
        className="w-12 h-12 text-[var(--rose-500)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
  },
};

export const GreenExtraSmall: Story = {
  args: {
    color: "green",
    size: "xs",
    children: (
      <svg
        className="w-4 h-4 text-[var(--green)]"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export const GreenSmall: Story = {
  args: {
    color: "green",
    size: "sm",
    children: (
      <svg
        className="w-5 h-5 text-[var(--green)]"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};
