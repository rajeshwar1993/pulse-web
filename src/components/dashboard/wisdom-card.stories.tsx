import type { Meta, StoryObj } from "@storybook/react";
import { WisdomCard } from "./wisdom-card";

const meta = {
  title: "Dashboard/WisdomCard",
  component: WisdomCard,
  tags: ["autodocs"],
  argTypes: {
    autoDismiss: {
      control: "boolean",
      description: "Whether the card automatically dismisses after a delay",
      table: { defaultValue: { summary: "true" } },
    },
    dismissDelay: {
      control: "number",
      description: "Auto-dismiss delay in milliseconds",
      table: { defaultValue: { summary: "3000" } },
    },
  },
  args: {
    autoDismiss: false,
  },
} satisfies Meta<typeof WisdomCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAutoDismiss: Story = {
  args: {
    autoDismiss: true,
    dismissDelay: 5000,
  },
};
