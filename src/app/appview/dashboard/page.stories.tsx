import type { Meta, StoryObj } from "@storybook/react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ToastProvider } from "@/components/providers/toast-provider";
import { mockConnections } from "@/stories/mock-data";

const meta = {
  title: "Pages/AppView/Dashboard",
  component: DashboardContent,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile" },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="min-h-screen bg-[var(--off-white)] p-6">
          <div className="max-w-4xl mx-auto">
            <Story />
          </div>
        </div>
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof DashboardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    displayName: "Alice",
    isActive: true,
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    connections: mockConnections,
    showWisdom: true,
    settingsHref: "/appview/settings",
  },
};

export const Inactive: Story = {
  args: {
    displayName: "Alice",
    isActive: false,
    pulseTime: null,
    connections: [],
    showWisdom: false,
    settingsHref: "/appview/settings",
  },
};
