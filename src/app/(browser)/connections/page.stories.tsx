import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ConnectionService } from "@/lib/services/connection-service";
import { mockConnectionsWithProfile } from "@/stories/mock-data";
import BrowserConnectionsPage from "./page";

const meta = {
  title: "Pages/Browser/Connections",
  component: BrowserConnectionsPage,
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
} satisfies Meta<typeof BrowserConnectionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithConnections: Story = {
  beforeEach: () => {
    ConnectionService.getActiveConnections = fn().mockResolvedValue(
      mockConnectionsWithProfile,
    );
    ConnectionService.removeConnection = fn().mockResolvedValue(undefined);
  },
  play: async ({ canvas, step }) => {
    await step("Wait for connections to load", async () => {
      await waitFor(() => expect(canvas.getByText("Mom")).toBeVisible());
    });

    await step("Verify connection count", async () => {
      await expect(canvas.getByText("3 connections")).toBeVisible();
    });

    await step("Click Remove and verify confirm modal", async () => {
      const removeButtons = canvas.getAllByText("Remove Connection");
      await userEvent.click(removeButtons[0]);

      await waitFor(() =>
        expect(
          canvas.getByText(
            "Remove this connection? You can restore it within 30 days.",
          ),
        ).toBeVisible(),
      );
    });
  },
};

export const Empty: Story = {
  beforeEach: () => {
    ConnectionService.getActiveConnections = fn().mockResolvedValue([]);
    ConnectionService.removeConnection = fn().mockResolvedValue(undefined);
  },
};
