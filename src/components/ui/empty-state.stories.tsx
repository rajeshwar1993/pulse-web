import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { IconBadge } from "./icon-badge";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Heading text for the empty state",
    },
    message: {
      control: "text",
      description: "Descriptive message below the title",
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = {
  args: {
    icon: (
      <IconBadge color="teal" size="lg">
        <svg
          className="w-12 h-12 text-[var(--teal)]"
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
      </IconBadge>
    ),
    title: "No connections yet",
    message:
      "Add your first connection to start sharing your daily pulse with family and friends.",
    action: <Button>Add Connection</Button>,
  },
};

export const WithoutAction: Story = {
  args: {
    icon: (
      <IconBadge color="teal" size="lg">
        <svg
          className="w-12 h-12 text-[var(--teal)]"
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
      </IconBadge>
    ),
    title: "No connections yet",
    message: "You haven't added any connections to your Pulse network.",
  },
};
