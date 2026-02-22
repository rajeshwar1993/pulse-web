import type { Meta, StoryObj } from "@storybook/react";
import { useTranslations } from "next-intl";
import { expect, userEvent, waitFor } from "storybook/test";
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

export const FillForm: Story = {
  play: async ({ canvas, step }) => {
    await step("Fill in matching passwords", async () => {
      const passwordInput = canvas.getByLabelText("Password");
      const confirmInput = canvas.getByLabelText("Confirm password");

      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "newpassword123");

      await expect(passwordInput).toHaveValue("newpassword123");
      await expect(confirmInput).toHaveValue("newpassword123");
    });

    await step("Verify submit button", async () => {
      const submitButton = canvas.getByRole("button", {
        name: "Update password",
      });
      await expect(submitButton).toBeVisible();
    });
  },
};

export const PasswordMismatch: Story = {
  play: async ({ canvas, step }) => {
    await step("Fill mismatched passwords", async () => {
      const passwordInput = canvas.getByLabelText("Password");
      const confirmInput = canvas.getByLabelText("Confirm password");

      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "different456");
    });

    await step("Submit and verify error", async () => {
      const submitButton = canvas.getByRole("button", {
        name: "Update password",
      });
      await userEvent.click(submitButton);

      await waitFor(() =>
        expect(canvas.getByText("Passwords do not match")).toBeVisible(),
      );
    });
  },
};
