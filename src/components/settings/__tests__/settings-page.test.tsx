import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPage } from "../settings-page";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Settings",
      language: "Language",
      backToDashboard: "Back to Dashboard",
      profile: "Profile",
      editProfile: "Edit profile",
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock LocaleService
const mockSetStoredLocale = vi.fn();
const mockSyncToProfile = vi.fn();
const mockNotifyFlutterBridge = vi.fn();
vi.mock("@/lib/services/locale-service", () => ({
  LocaleService: {
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    setStoredLocale: (...args: any[]) => mockSetStoredLocale(...args),
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    syncToProfile: (...args: any[]) => mockSyncToProfile(...args),
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    notifyFlutterBridge: (...args: any[]) => mockNotifyFlutterBridge(...args),
  },
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the settings title", () => {
    render(<SettingsPage currentLocale="en" />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should render the language section heading", () => {
    render(<SettingsPage currentLocale="en" />);

    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("should render a back link to the dashboard", () => {
    render(<SettingsPage currentLocale="en" />);

    const backLink = screen.getByRole("link", { name: /back to dashboard/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/appview/dashboard");
  });

  it("should render the LanguageSelector component", () => {
    render(<SettingsPage currentLocale="en" />);

    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("should call LocaleService methods when locale is changed", () => {
    render(<SettingsPage currentLocale="en" />);

    const englishButton = screen.getByRole("radio", { name: /English/i });
    fireEvent.click(englishButton);

    expect(mockSetStoredLocale).toHaveBeenCalledWith("en");
    expect(mockSyncToProfile).toHaveBeenCalledWith("en");
    expect(mockNotifyFlutterBridge).toHaveBeenCalledWith("en");
    expect(mockRefresh).toHaveBeenCalled();
  });

  describe("Profile Card", () => {
    const mockProfile = {
      display_name: "Alex Johnson",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
    };

    it("should render the profile card when profile is provided", () => {
      render(<SettingsPage currentLocale="en" profile={mockProfile} />);

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    });

    it("should render the avatar with correct src and alt", () => {
      render(<SettingsPage currentLocale="en" profile={mockProfile} />);

      const avatar = screen.getByAltText("Alex Johnson");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("src", mockProfile.avatar_url);
    });

    it("should render an edit link with default appview href", () => {
      render(<SettingsPage currentLocale="en" profile={mockProfile} />);

      const editLink = screen.getByRole("link", { name: /edit profile/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute(
        "href",
        "/appview/profile-setup?mode=edit",
      );
    });

    it("should use custom profileSetupHref when provided", () => {
      render(
        <SettingsPage
          currentLocale="en"
          profile={mockProfile}
          profileSetupHref="/profile-setup?mode=edit"
        />,
      );

      const editLink = screen.getByRole("link", { name: /edit profile/i });
      expect(editLink).toHaveAttribute("href", "/profile-setup?mode=edit");
    });

    it("should not render the profile card when profile is undefined", () => {
      render(<SettingsPage currentLocale="en" />);

      expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /edit profile/i }),
      ).not.toBeInTheDocument();
    });
  });
});
