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
      emailLabel: "Send via Email",
      emailPlaceholder: "friend@example.com",
      sendRequest: "Send",
      inviteSent: "Invite sent!",
      invalidEmail: "Please enter a valid email address",
      shareButton: "Share using other apps",
      shareSubtext: "Share with WhatsApp, Instagram, and more",
      shareTitle: "Join Pulse",
      linkCopied: "Invite link copied!",
      generateError: "Failed to generate invite code",
      sendError: "Failed to send request. Please try again.",
      alreadyConnected: "You're already connected with this person",
      alreadyPending: "A request to this person is already pending",
      seatUnavailable: "This seat is no longer available",
      selfEmailError: "You can't send a request to yourself",
      close: "Close",
    };
    if (key === "shareText" && params) {
      return `Join me on Pulse! Use code: ${params.code}`;
    }
    return translations[key] || key;
  },
}));

const mockSendRequest = vi.fn();
const mockGenerateInviteCode = vi.fn();

vi.mock("@/lib/services/connection-request-service", () => ({
  ConnectionRequestService: {
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    sendRequest: (...args: any[]) => mockSendRequest(...args),
  },
}));

vi.mock("@/lib/services/connection-service", () => ({
  ConnectionService: {
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    generateInviteCode: (...args: any[]) => mockGenerateInviteCode(...args),
  },
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
    mockSendRequest.mockResolvedValue("request-id-1");
  });

  it("should render the modal with email input and share button", () => {
    render(<InviteModal onClose={onClose} />);

    expect(screen.getByText("Invite Connection")).toBeInTheDocument();
    expect(screen.getByText("Send via Email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("friend@example.com"),
    ).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
    expect(screen.getByText("Share using other apps")).toBeInTheDocument();
    expect(
      screen.getByText("Share with WhatsApp, Instagram, and more"),
    ).toBeInTheDocument();
  });

  it("should call onClose when close button clicked", async () => {
    render(<InviteModal onClose={onClose} />);

    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find((btn) =>
      btn.querySelector('svg path[d*="M6 18L18 6"]'),
    );
    expect(closeButton).toBeDefined();

    // biome-ignore lint/style/noNonNullAssertion: test assertion — closeButton verified via expect above
    await userEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should show error toast for invalid email", async () => {
    render(<InviteModal onClose={onClose} />);

    const emailInput = screen.getByPlaceholderText("friend@example.com");
    await userEvent.type(emailInput, "not-an-email");
    await userEvent.click(screen.getByText("Send"));

    expect(mockShowToast).toHaveBeenCalledWith(
      "Please enter a valid email address",
      "error",
    );
    expect(mockSendRequest).not.toHaveBeenCalled();
  });

  it("should send connection request and show success toast", async () => {
    render(<InviteModal onClose={onClose} />);

    const emailInput = screen.getByPlaceholderText("friend@example.com");
    await userEvent.type(emailInput, "friend@example.com");
    await userEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith("friend@example.com");
    });

    expect(mockShowToast).toHaveBeenCalledWith("Invite sent!", "success");
  });

  it("should use navigator.share when available on share button click", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    render(<InviteModal onClose={onClose} />);

    await userEvent.click(screen.getByText("Share using other apps"));

    await waitFor(() => {
      expect(mockGenerateInviteCode).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: "Join Pulse",
        text: "Join me on Pulse! Use code: ABC123",
      });
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

    await userEvent.click(screen.getByText("Share using other apps"));

    await waitFor(() => {
      expect(mockGenerateInviteCode).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      "Invite link copied!",
      "success",
    );
  });

  it("should show specific error when already connected", async () => {
    mockSendRequest.mockRejectedValue({
      message: "Already connected with this user",
      code: "P0001",
    });

    render(<InviteModal onClose={onClose} />);

    const emailInput = screen.getByPlaceholderText("friend@example.com");
    await userEvent.type(emailInput, "friend@example.com");
    await userEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "You're already connected with this person",
        "error",
      );
    });
  });

  it("should show specific error when request already pending", async () => {
    mockSendRequest.mockRejectedValue({
      message: "A pending connection request already exists",
      code: "P0001",
    });

    render(<InviteModal onClose={onClose} />);

    const emailInput = screen.getByPlaceholderText("friend@example.com");
    await userEvent.type(emailInput, "friend@example.com");
    await userEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "A request to this person is already pending",
        "error",
      );
    });
  });

  it("should show error toast when share code generation fails", async () => {
    mockGenerateInviteCode.mockRejectedValue(new Error("Network error"));

    render(<InviteModal onClose={onClose} />);

    await userEvent.click(screen.getByText("Share using other apps"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Failed to generate invite code",
        "error",
      );
    });
  });
});
