import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "../signup-form";

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
      emailLabel: "Email",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      submitButton: "Create account",
      passwordHint: "Must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
      verificationSent: "Check your email to verify your account",
      hasAccount: "Already have an account?",
      logInLink: "Log in",
    };
    return translations[key] || key;
  },
}));

const mockSignUp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}));

function fillForm(email: string, password: string, confirm: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: confirm },
  });
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("should show error when password is less than 8 characters", async () => {
    render(<SignupForm />);

    fillForm("test@example.com", "short", "short");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Must be at least 8 characters",
      );
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show error when passwords do not match", async () => {
    render(<SignupForm />);

    fillForm("test@example.com", "password123", "different123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should call signUp and show verification message on success", async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<SignupForm />);

    fillForm("test@example.com", "password123", "password123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(
        screen.getByText("Check your email to verify your account"),
      ).toBeInTheDocument();
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      options: {
        emailRedirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("should show error on signUp failure", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "Email already registered" },
    });

    render(<SignupForm />);

    fillForm("test@example.com", "password123", "password123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  it("should render log in link", () => {
    render(<SignupForm />);

    expect(screen.getByText("Log in")).toHaveAttribute("href", "/login");
  });

  it("should show password hint text", () => {
    render(<SignupForm />);

    expect(
      screen.getByText("Must be at least 8 characters"),
    ).toBeInTheDocument();
  });
});
