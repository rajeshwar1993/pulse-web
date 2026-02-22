import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ToastProvider } from "@/components/providers/toast-provider";
import { InviteModal } from "./invite-modal";

const meta = {
  title: "Connections/InviteModal",
  component: InviteModal,
  tags: ["autodocs"],
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
