import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthButtons } from "../oauth-buttons";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      googleButton: "Continue with Google",
    };
    return translations[key] || key;
  },
}));

const mockSignInWithOAuth = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

describe("OAuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Google button", () => {
    render(<OAuthButtons />);

    expect(
      screen.getByRole("button", { name: /Continue with Google/i }),
    ).toBeInTheDocument();
  });

  it("should call signInWithOAuth with google provider on click", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    render(<OAuthButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  it("should use custom redirectTo when provided", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    render(<OAuthButtons redirectTo="/appview/auth/callback" />);

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/appview/auth/callback"),
        },
      });
    });
  });

  it("should re-enable button on OAuth error", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      error: { message: "OAuth failed" },
    });

    render(<OAuthButtons />);

    const button = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
