import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ToastProvider } from "@/components/providers/toast-provider";
import { supabase } from "@/lib/supabase/client";
import { mockUser } from "@/stories/mock-data";
import InvitePage from "./page";

const meta = {
  title: "Pages/Browser/Invite",
  component: InvitePage,
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
} satisfies Meta<typeof InvitePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  parameters: {
    nextjs: {
      navigation: {
        searchParams: { code: "ABC123" },
      },
    },
  },
  beforeEach: () => {
    supabase.auth.getUser = fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  },
};

export const NoCode: Story = {
  parameters: {
    nextjs: {
      navigation: {
        searchParams: {},
      },
    },
  },
  beforeEach: () => {
    supabase.auth.getUser = fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  },
};
