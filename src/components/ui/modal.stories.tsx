import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./button";
import { Modal } from "./modal";

const meta = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    children: (
      <div>
        <h2 className="text-xl font-semibold text-[var(--slate-900)] mb-4">
          Confirm Action
        </h2>
        <p className="text-[var(--slate-600)] mb-6">
          Are you sure you want to proceed?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">
            Cancel
          </Button>
          <Button variant="primary" size="sm">
            Confirm
          </Button>
        </div>
      </div>
    ),
  },
};

export const SmallWidth: Story = {
  args: {
    open: true,
    maxWidth: "sm",
    children: (
      <div>
        <p className="text-[var(--slate-900)] font-medium mb-4">
          Remove this connection? You can restore it within 30 days.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" size="sm" className="flex-1">
            Remove
          </Button>
        </div>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    children: <p>This should not be visible.</p>,
  },
};
