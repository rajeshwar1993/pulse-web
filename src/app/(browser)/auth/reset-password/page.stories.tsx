import type { Meta, StoryObj } from "@storybook/react";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Heading } from "@/components/ui/heading";

function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");

  return (
    <AuthLayout>
      <Heading as="h1" size="lg" className="text-center mb-2">
        {t("title")}
      </Heading>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

const meta = {
  title: "Pages/Browser/ResetPassword",
  component: ResetPasswordPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ResetPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
