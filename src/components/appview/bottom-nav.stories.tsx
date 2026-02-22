import type { Meta, StoryObj } from "@storybook/react";
import { BottomNav } from "./bottom-nav";

const meta = {
  title: "AppView/BottomNav",
  component: BottomNav,
  tags: ["autodocs"],
  parameters: {
    viewport: { defaultViewport: "mobile" },
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/appview/dashboard",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100dvh", position: "relative" }}>
        <div className="p-4 text-center text-[var(--slate-400)] text-sm">
          Page content area
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/appview/dashboard" } },
  },
};

export const Settings: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/appview/settings" } },
  },
};

export const Connections: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/appview/connections" } },
  },
};
