import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent } from "storybook/test";
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

export const FillProfile: Story = {
  play: async ({ canvas, step }) => {
    await step("Type display name and verify char count", async () => {
      const nameInput = canvas.getByLabelText("Display Name");
      await userEvent.type(nameInput, "Alice");

      await expect(nameInput).toHaveValue("Alice");
      await expect(canvas.getByText("5/50")).toBeVisible();
    });

    await step("Select an avatar and verify preview", async () => {
      const avatarButtons = canvas.getAllByRole("button", {
        name: "Avatar",
      });
      await userEvent.click(avatarButtons[0]);

      await expect(canvas.getByText("Selected Avatar")).toBeVisible();
      await expect(canvas.getByAltText("Selected")).toBeVisible();
    });

    await step("Verify continue button is enabled", async () => {
      const continueButton = canvas.getByRole("button", {
        name: "Continue",
      });
      await expect(continueButton).toBeEnabled();
    });
  },
};
