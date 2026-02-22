import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent } from "storybook/test";
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

export const ButtonDisabledWhenIncomplete: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify button is disabled without input", async () => {
      const continueButton = canvas.getByRole("button", {
        name: "Continue",
      });
      await expect(continueButton).toBeDisabled();
    });

    await step("Type single character — still disabled", async () => {
      const nameInput = canvas.getByLabelText("Display Name");
      await userEvent.type(nameInput, "A");

      const continueButton = canvas.getByRole("button", {
        name: "Continue",
      });
      await expect(continueButton).toBeDisabled();
    });
  },
};
