import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "../forgot-password-form";

vi.mock("next/link", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      submitButton: "Send reset link",
      successMessage: "Check your email for a password reset link",
      backToLogin: "Back to login",
    };
    return translations[key] || key;
  },
}));

const mockResetPasswordForEmail = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) =>
        mockResetPasswordForEmail(...args),
    },
  },
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email field and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send reset link" }),
    ).toBeInTheDocument();
  });

  it("should render back to login link", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText("Back to login")).toHaveAttribute("href", "/auth/login");
  });

  it("should call resetPasswordForEmail with email and redirectTo", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith("user@test.com", {
        redirectTo: expect.stringContaining("/reset-password"),
      });
    });
  });

  it("should show success message after sending reset link", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(
        screen.getByText("Check your email for a password reset link"),
      ).toBeInTheDocument();
    });

    // Form should be replaced by success view with back to login link
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.getByText("Back to login")).toHaveAttribute("href", "/auth/login");
  });

  it("should show error on failure", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
    });

    // Form should still be visible
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
