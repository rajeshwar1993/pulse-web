import type { Meta, StoryObj } from "@storybook/react";
import ProfileSetup from "./page";

const meta = {
  title: "Pages/AppView/ProfileSetup",
  component: ProfileSetup,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile" },
  },
} satisfies Meta<typeof ProfileSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
