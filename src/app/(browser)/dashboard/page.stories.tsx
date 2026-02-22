import type { Meta, StoryObj } from "@storybook/react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ToastProvider } from "@/components/providers/toast-provider";
import type { DashboardConnection } from "@/lib/types/connection";
import { mockConnections } from "@/stories/mock-data";

function BrowserDashboardStory({
  displayName,
  isActive,
  pulseTime,
  connections,
}: {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  connections: DashboardConnection[];
}) {
  return (
    <DashboardContent
      displayName={displayName}
      isActive={isActive}
      pulseTime={pulseTime}
      connections={connections}
      showWisdom={isActive}
      settingsHref="/settings"
    />
  );
}

const meta = {
  title: "Pages/Browser/Dashboard",
  component: BrowserDashboardStory,
  parameters: {
    layout: "fullscreen",
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
} satisfies Meta<typeof BrowserDashboardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    displayName: "Alice",
    isActive: true,
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    connections: mockConnections,
  },
};

export const Inactive: Story = {
  args: {
    displayName: "Alice",
    isActive: false,
    pulseTime: null,
    connections: mockConnections,
  },
};

export const WithConnections: Story = {
  args: {
    displayName: "Alice",
    isActive: true,
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    connections: mockConnections,
  },
};

export const Empty: Story = {
  args: {
    displayName: "Alice",
    isActive: false,
    pulseTime: null,
    connections: [],
  },
};
