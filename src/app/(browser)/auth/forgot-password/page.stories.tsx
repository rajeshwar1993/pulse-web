import type { Meta, StoryObj } from "@storybook/react";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Heading } from "@/components/ui/heading";

function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");

  return (
    <AuthLayout>
      <Heading as="h1" size="lg" className="text-center mb-2">
        {t("title")}
      </Heading>
      <p className="text-center text-[var(--slate-500)] mb-6">
        {t("subtitle")}
      </p>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

const meta = {
  title: "Pages/Browser/ForgotPassword",
  component: ForgotPasswordPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
