import type { Meta, StoryObj } from "@storybook/react";
import { useTranslations } from "next-intl";
import { expect, userEvent, waitFor } from "storybook/test";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignupForm } from "@/components/auth/signup-form";
import { Heading } from "@/components/ui/heading";

function SignupPage() {
  const t = useTranslations("auth.signup");

  return (
    <AuthLayout>
      <Heading as="h1" size="lg" className="text-center mb-2">
        {t("title")}
      </Heading>
      <p className="text-center text-[var(--slate-500)] mb-6">
        {t("subtitle")}
      </p>

      <SignupForm />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--slate-200)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-[var(--slate-400)]">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <OAuthButtons />
    </AuthLayout>
  );
}

const meta = {
  title: "Pages/Browser/Signup",
  component: SignupPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SignupPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FillForm: Story = {
  play: async ({ canvas, step }) => {
    await step("Fill in all fields", async () => {
      const emailInput = canvas.getByLabelText("Email");
      const passwordInput = canvas.getByLabelText("Password");
      const confirmInput = canvas.getByLabelText("Confirm password");

      await userEvent.type(emailInput, "alice@example.com");
      await userEvent.type(passwordInput, "password123");
      await userEvent.type(confirmInput, "password123");

      await expect(emailInput).toHaveValue("alice@example.com");
      await expect(passwordInput).toHaveValue("password123");
      await expect(confirmInput).toHaveValue("password123");
    });

    await step("Verify submit button", async () => {
      const submitButton = canvas.getByRole("button", {
        name: "Create account",
      });
      await expect(submitButton).toBeVisible();
    });
  },
};

export const PasswordMismatch: Story = {
  play: async ({ canvas, step }) => {
    await step("Fill form with mismatched passwords", async () => {
      const emailInput = canvas.getByLabelText("Email");
      const passwordInput = canvas.getByLabelText("Password");
      const confirmInput = canvas.getByLabelText("Confirm password");

      await userEvent.type(emailInput, "alice@example.com");
      await userEvent.type(passwordInput, "password123");
      await userEvent.type(confirmInput, "different456");
    });

    await step("Submit and verify error", async () => {
      const submitButton = canvas.getByRole("button", {
        name: "Create account",
      });
      await userEvent.click(submitButton);

      await waitFor(() =>
        expect(canvas.getByText("Passwords do not match")).toBeVisible(),
      );
    });
  },
};

export const PasswordTooShort: Story = {
  play: async ({ canvas, step }) => {
    await step("Fill form with short password", async () => {
      const emailInput = canvas.getByLabelText("Email");
      const passwordInput = canvas.getByLabelText("Password");
      const confirmInput = canvas.getByLabelText("Confirm password");

      await userEvent.type(emailInput, "alice@example.com");
      await userEvent.type(passwordInput, "short");
      await userEvent.type(confirmInput, "short");
    });

    await step("Submit and verify error", async () => {
      const submitButton = canvas.getByRole("button", {
        name: "Create account",
      });
      await userEvent.click(submitButton);

      await waitFor(() =>
        expect(canvas.getByRole("alert")).toBeVisible(),
      );
    });
  },
};
