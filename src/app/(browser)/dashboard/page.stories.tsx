import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ToastProvider } from "@/components/providers/toast-provider";
import type { DashboardConnection } from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";
import {
  mockConnections,
  mockSeats,
  mockSeatsEmpty,
} from "@/stories/mock-data";

function BrowserDashboardStory({
  displayName,
  isActive,
  pulseTime,
  seats,
  connections,
  currentStreak = 3,
  pulsedDates = ["2026-02-24", "2026-02-25", "2026-02-26"],
  totalDays = 15,
  todayPulseDay = "2026-02-26",
}: {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  seats: DashboardSeat[];
  connections: DashboardConnection[];
  currentStreak?: number;
  pulsedDates?: string[];
  totalDays?: number;
  todayPulseDay?: string;
}) {
  return (
    <DashboardContent
      displayName={displayName}
      isActive={isActive}
      pulseTime={pulseTime}
      seats={seats}
      connections={connections}
      currentStreak={currentStreak}
      pulsedDates={pulsedDates}
      totalDays={totalDays}
      todayPulseDay={todayPulseDay}
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
    seats: mockSeats,
    connections: mockConnections,
  },
  play: async ({ canvas, step }) => {
    await step("Verify greeting contains name", async () => {
      await expect(canvas.getByText(/Alice!/)).toBeVisible();
    });

    await step("Verify active status", async () => {
      await expect(canvas.getByText("You are active today")).toBeVisible();
    });

    await step("Verify connections are displayed", async () => {
      await expect(canvas.getByText("Mom")).toBeVisible();
      await expect(canvas.getByText("Dad")).toBeVisible();
      await expect(canvas.getByText("Sibling")).toBeVisible();
    });
  },
};

export const Inactive: Story = {
  args: {
    displayName: "Alice",
    isActive: false,
    pulseTime: null,
    seats: mockSeats,
    connections: mockConnections,
  },
};

export const WithConnections: Story = {
  args: {
    displayName: "Alice",
    isActive: true,
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    seats: mockSeats,
    connections: mockConnections,
  },
};

export const Empty: Story = {
  args: {
    displayName: "Alice",
    isActive: false,
    pulseTime: null,
    seats: mockSeatsEmpty,
    connections: [],
  },
};
