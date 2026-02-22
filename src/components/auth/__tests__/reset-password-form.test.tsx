import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "../reset-password-form";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      submitButton: "Update password",
      title: "Set new password",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      passwordHint: "Must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
    };
    return translations[key] || key;
  },
}));

const mockUpdateUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render password and confirm password fields", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update password" }),
    ).toBeInTheDocument();
  });

  it("should show error when password is less than 8 characters", async () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(
        screen.getByText("Must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("should show error when passwords do not match", async () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("should call updateUser and redirect to /login on success", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "newpassword123",
      });
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should show error on updateUser failure", async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: "Password too weak" },
    });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(screen.getByText("Password too weak")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
