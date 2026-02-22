import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./button";
import { Heading } from "./heading";
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
        <Heading as="h2" size="base" className="mb-4">
          Confirm Action
        </Heading>
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

export const LargePadding: Story = {
  args: {
    open: true,
    padding: "lg",
    ariaLabelledBy: "modal-title",
    children: (
      <div>
        <Heading as="h2" size="md" id="modal-title" className="mb-6">
          Invite Connection
        </Heading>
        <div className="bg-[var(--slate-50)] rounded-lg p-8 mb-6 flex justify-center">
          <div className="w-48 h-48 bg-[var(--slate-200)] rounded-lg flex items-center justify-center text-[var(--slate-400)]">
            QR Code
          </div>
        </div>
        <Button size="lg">Share Invite</Button>
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
