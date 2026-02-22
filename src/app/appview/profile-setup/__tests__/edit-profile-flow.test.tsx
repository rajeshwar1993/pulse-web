/**
 * Integration test: Settings → Edit Profile flow
 *
 * Verifies the full user journey:
 * 1. Settings page renders profile card with user data
 * 2. Edit link points to profile-setup?mode=edit
 * 3. Profile-setup in edit mode loads and prefills existing data
 * 4. Submitting uses update (not insert) and redirects to settings
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPage } from "@/components/settings/settings-page";
import ProfileSetup from "../page";

// --- Shared mocks ---

const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      settings: {
        title: "Settings",
        language: "Language",
        backToDashboard: "Back to Dashboard",
        profile: "Profile",
        editProfile: "Edit profile",
      },
      profileSetup: {
        title: "Set up your profile",
        editTitle: "Edit your profile",
        displayNameLabel: "Display Name",
        displayNamePlaceholder: "Enter your name",
        displayNameCount: "{count}/50",
        chooseAvatar: "Choose your avatar",
        selectedAvatar: "Selected Avatar",
        avatarAlt: "Avatar",
        selectedAlt: "Selected",
        creating: "Creating...",
        saving: "Saving...",
        continue: "Continue",
        "error.noUser": "No user",
        "error.createFailed": "Failed to create profile",
        "error.loadFailed": "Failed to load profile",
        "error.updateFailed": "Failed to update profile",
      },
      common: {
        loading: "Loading...",
        save: "Save",
      },
    };
    return translations[namespace]?.[key] || key;
  },
}));

vi.mock("@/lib/services/locale-service", () => ({
  LocaleService: {
    setStoredLocale: vi.fn(),
    syncToProfile: vi.fn(),
    notifyFlutterBridge: vi.fn(),
  },
}));

const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    from: (_table: any) => ({
      insert: (data: unknown) => mockInsert(data),
      update: (data: unknown) => ({
        eq: (_col: string, _val: string) => mockUpdate(data),
      }),
      select: (_cols: string) => ({
        eq: (_col: string, _val: string) => ({
          single: () => mockSingle(),
        }),
      }),
    }),
  },
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn() },
}));

// --- Test data ---

const mockProfile = {
  display_name: "Alex Johnson",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
};

const mockUser = { id: "user-123", email: "alex@example.com" };

describe("Settings → Edit Profile integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  it("should render profile card in settings with correct edit link", () => {
    render(<SettingsPage currentLocale="en" profile={mockProfile} />);

    // Profile card is visible
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByAltText("Alex Johnson")).toHaveAttribute(
      "src",
      mockProfile.avatar_url,
    );

    // Edit link points to profile-setup with mode=edit
    const editLink = screen.getByRole("link", { name: /edit profile/i });
    expect(editLink).toHaveAttribute(
      "href",
      "/appview/profile-setup?mode=edit",
    );
  });

  it("should load profile-setup in edit mode, prefill data, update, and redirect to settings", async () => {
    // Simulate navigating to ?mode=edit
    mockSearchParams = new URLSearchParams("mode=edit");

    mockSingle.mockResolvedValue({
      data: mockProfile,
      error: null,
    });
    mockUpdate.mockResolvedValue({ error: null });

    render(<ProfileSetup />);

    // Shows edit title
    expect(screen.getByText("Edit your profile")).toBeInTheDocument();

    // Shows loading while fetching
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for prefill
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Form is prefilled
    expect(screen.getByLabelText("Display Name")).toHaveValue("Alex Johnson");

    // Save button visible (not Continue)
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    // Edit the name and submit
    fireEvent.change(screen.getByLabelText("Display Name"), {
      target: { value: "Alex J." },
    });
    fireEvent.click(saveButton);

    // Should use update (not insert) and redirect to settings
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: "Alex J.",
          avatar_url: mockProfile.avatar_url,
        }),
      );
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/appview/settings");
    });
  });

  it("should use insert and redirect to dashboard in create mode", async () => {
    // Default create mode (no ?mode=edit)
    mockInsert.mockResolvedValue({ error: null });

    render(<ProfileSetup />);

    // Shows create title
    expect(screen.getByText("Set up your profile")).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText("Display Name"), {
      target: { value: "New User" },
    });
    const avatars = screen.getAllByAltText("Avatar");
    fireEvent.click(avatars[0]);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-123",
          display_name: "New User",
        }),
      );
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/appview/dashboard");
    });
  });
});
