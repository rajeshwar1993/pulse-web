import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { SettingsPage } from "@/components/settings/settings-page";

const meta = {
  title: "Pages/Browser/Settings",
  component: SettingsPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[var(--off-white)] p-6">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentLocale: "en",
    dashboardHref: "/dashboard",
  },
  play: async ({ canvas, step }) => {
    await step("Verify settings title", async () => {
      await expect(canvas.getByText("Settings")).toBeVisible();
    });

    await step("Verify language heading", async () => {
      await expect(canvas.getByText("Language")).toBeVisible();
    });

    await step("Verify English is selected", async () => {
      const englishRadio = canvas.getByRole("radio", { name: /English/ });
      await expect(englishRadio).toHaveAttribute("aria-checked", "true");
    });
  },
};
