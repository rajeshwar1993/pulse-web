import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ToastProvider } from "@/components/providers/toast-provider";
import { InviteModal } from "./invite-modal";

const meta = {
  title: "Connections/InviteModal",
  component: InviteModal,
  tags: ["autodocs"],
  argTypes: {
    onClose: {
      action: "onClose",
      description: "Callback invoked when the modal is closed",
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof InviteModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
