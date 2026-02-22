import type { Meta, StoryObj } from "@storybook/react";
import { useTranslations } from "next-intl";
import { expect, userEvent } from "storybook/test";
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

export const FillEmail: Story = {
  play: async ({ canvas, step }) => {
    await step("Type email address", async () => {
      const emailInput = canvas.getByLabelText("Email");
      await userEvent.type(emailInput, "alice@example.com");
      await expect(emailInput).toHaveValue("alice@example.com");
    });

    await step("Verify submit button", async () => {
      const submitButton = canvas.getByRole("button", {
        name: "Send reset link",
      });
      await expect(submitButton).toBeVisible();
    });

    await step("Verify back to login link", async () => {
      await expect(canvas.getByText("Back to login")).toBeVisible();
    });
  },
};
