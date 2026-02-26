import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor } from "storybook/test";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ConnectionService } from "@/lib/services/connection-service";
import { SeatService } from "@/lib/services/seat-service";
import { mockSeats, mockSeatsEmpty } from "@/stories/mock-data";
import ConnectionsPage from "./page";

const meta = {
  title: "Pages/AppView/Connections",
  component: ConnectionsPage,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile" },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ConnectionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithConnections: Story = {
  beforeEach: () => {
    SeatService.getSeats = fn().mockResolvedValue(mockSeats);
    ConnectionService.removeConnection = fn().mockResolvedValue(undefined);
  },
  play: async ({ canvas, step }) => {
    await step("Wait for seats to load", async () => {
      await waitFor(() => expect(canvas.getByText("Mom")).toBeVisible());
    });

    await step("Verify connection count", async () => {
      await expect(canvas.getByText("3 connections")).toBeVisible();
    });
  },
};

export const Empty: Story = {
  beforeEach: () => {
    SeatService.getSeats = fn().mockResolvedValue(mockSeatsEmpty);
    ConnectionService.removeConnection = fn().mockResolvedValue(undefined);
  },
};
