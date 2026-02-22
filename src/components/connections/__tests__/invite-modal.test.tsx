import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteModal } from "../invite-modal";

const mockShowToast = vi.fn();

vi.mock("@/components/providers/toast-provider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("next-intl", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock params
  useTranslations: () => (key: string, params?: any) => {
    const translations: Record<string, string> = {
      title: "Invite Connection",
      codeLabel: "Invite Code",
      expiryInfo: "Expires in 30 days",
      shareButton: "Share Invite",
      shareTitle: "Join Pulse",
      generateError: "Failed to generate invite code",
    };
    if (key === "shareText" && params) {
      return `Join me on Pulse! Use code: ${params.code}`;
    }
    return translations[key] || key;
  },
}));

const mockGenerateInviteCode = vi.fn();

vi.mock("@/lib/services/connection-service", () => ({
  ConnectionService: {
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    generateInviteCode: (...args: any[]) => mockGenerateInviteCode(...args),
  },
}));

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg data-testid="qr-code" data-value={value} />
  ),
}));

const mockInviteCode = {
  id: "inv-1",
  code: "ABC123",
  creator_id: "user-1",
  created_at: "2026-02-22T00:00:00Z",
  expires_at: "2026-03-24T00:00:00Z",
  accepted_by: null,
  accepted_at: null,
};

describe("InviteModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateInviteCode.mockResolvedValue(mockInviteCode);
  });

  it("should show loading spinner initially", () => {
    mockGenerateInviteCode.mockReturnValue(new Promise(() => {})); // never resolves
    render(<InviteModal onClose={onClose} />);

    expect(screen.getByText("Invite Connection")).toBeInTheDocument();
    // Spinner is an animated div, not a role — check the structure
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should display invite code after loading", async () => {
    render(<InviteModal onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("ABC123")).toBeInTheDocument();
    });

    expect(screen.getByTestId("qr-code")).toHaveAttribute(
      "data-value",
      "pulse://invite?code=ABC123",
    );
    expect(screen.getByText("Expires in 30 days")).toBeInTheDocument();
  });

  it("should call onClose when close button clicked", async () => {
    render(<InviteModal onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("ABC123")).toBeInTheDocument();
    });

    // The close button is the X icon button in the header
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find((btn) =>
      btn.querySelector('svg path[d*="M6 18L18 6"]'),
    );
    expect(closeButton).toBeDefined();

    // biome-ignore lint/style/noNonNullAssertion: test assertion — closeButton verified via expect above
    await userEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should show error toast and close on generate failure", async () => {
    mockGenerateInviteCode.mockRejectedValue(new Error("Network error"));

    render(<InviteModal onClose={onClose} />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Failed to generate invite code",
        "error",
      );
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should copy invite URL to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<InviteModal onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("ABC123")).toBeInTheDocument();
    });

    // Click the copy button (the one next to the code input)
    const copyButton = screen.getByTitle("Copy code");
    await userEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("pulse://invite?code=ABC123");
  });

  it("should use navigator.share when available", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    render(<InviteModal onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("ABC123")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Share Invite"));

    expect(mockShare).toHaveBeenCalledWith({
      title: "Join Pulse",
      text: "Join me on Pulse! Use code: ABC123",
    });

    // Clean up
    Object.assign(navigator, { share: undefined });
  });

  it("should fallback to clipboard when navigator.share is absent", async () => {
    Object.assign(navigator, { share: undefined });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<InviteModal onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("ABC123")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Share Invite"));

    expect(writeText).toHaveBeenCalledWith("pulse://invite?code=ABC123");
  });
});
