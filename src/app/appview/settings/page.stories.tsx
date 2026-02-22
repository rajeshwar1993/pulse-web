import type { Meta, StoryObj } from "@storybook/react";
import { SettingsPage } from "@/components/settings/settings-page";

const meta = {
  title: "Pages/AppView/Settings",
  component: SettingsPage,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile" },
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
    profile: {
      display_name: "Alex Johnson",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
    },
  },
};

export const WithoutProfile: Story = {
  args: {
    currentLocale: "en",
  },
};
