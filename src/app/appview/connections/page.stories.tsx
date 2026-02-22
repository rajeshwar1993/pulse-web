import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ConnectionService } from "@/lib/services/connection-service";
import { mockConnectionsWithProfile } from "@/stories/mock-data";
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
