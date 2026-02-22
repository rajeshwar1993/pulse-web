import type { Meta, StoryObj } from "@storybook/react";
import BrowserProfileSetup from "./page";

const meta = {
  title: "Pages/Browser/ProfileSetup",
  component: BrowserProfileSetup,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[var(--off-white)] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrowserProfileSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
