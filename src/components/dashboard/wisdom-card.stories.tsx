import type { Meta, StoryObj } from "@storybook/react";
import { WisdomCard } from "./wisdom-card";

const meta = {
  title: "Dashboard/WisdomCard",
  component: WisdomCard,
  tags: ["autodocs"],
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
