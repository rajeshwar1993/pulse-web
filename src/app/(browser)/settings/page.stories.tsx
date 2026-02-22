import type { Meta, StoryObj } from "@storybook/react";
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
};
