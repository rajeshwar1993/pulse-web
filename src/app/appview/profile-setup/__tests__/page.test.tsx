import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileSetup from "../page";

// Mock next-intl — supports namespaced lookups via useTranslations
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
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

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Supabase client
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
      update: (data: unknown) => {
        const chain = {
          eq: (_col: string, _val: string) => mockUpdate(data),
        };
        return chain;
      },
      select: (_cols: string) => ({
        eq: (_col: string, _val: string) => ({
          single: () => mockSingle(),
        }),
      }),
    }),
  },
}));

// Mock logger
vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock server action
vi.mock("@/lib/actions/profile", () => ({
  revalidateProfilePages: vi.fn().mockResolvedValue(undefined),
}));

const mockUser = { id: "user-123", email: "test@example.com" };

describe("ProfileSetup (appview)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  describe("Create mode (default)", () => {
    it("should render the create mode title", () => {
      render(<ProfileSetup />);
      expect(screen.getByText("Set up your profile")).toBeInTheDocument();
    });

    it("should render the Continue button", () => {
      render(<ProfileSetup />);
      expect(
        screen.getByRole("button", { name: "Continue" }),
      ).toBeInTheDocument();
    });

    it("should not show loading state in create mode", () => {
      render(<ProfileSetup />);
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should disable submit when form is incomplete", () => {
      render(<ProfileSetup />);
      const button = screen.getByRole("button", { name: "Continue" });
      expect(button).toBeDisabled();
    });

    it("should enable submit when name and avatar are selected", () => {
      render(<ProfileSetup />);

      fireEvent.change(screen.getByLabelText("Display Name"), {
        target: { value: "Test User" },
      });

      const avatars = screen.getAllByAltText("Avatar");
      fireEvent.click(avatars[0]);

      const button = screen.getByRole("button", { name: "Continue" });
      expect(button).toBeEnabled();
    });

    it("should call insert and navigate to dashboard on submit", async () => {
      mockInsert.mockResolvedValue({ error: null });

      render(<ProfileSetup />);

      fireEvent.change(screen.getByLabelText("Display Name"), {
        target: { value: "Test User" },
      });
      const avatars = screen.getAllByAltText("Avatar");
      fireEvent.click(avatars[0]);

      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "user-123",
            email: "test@example.com",
            display_name: "Test User",
          }),
        );
        expect(mockPush).toHaveBeenCalledWith("/appview/dashboard");
      });
    });

    it("should show error when insert fails", async () => {
      mockInsert.mockResolvedValue({
        error: new Error("Insert failed"),
      });

      render(<ProfileSetup />);

      fireEvent.change(screen.getByLabelText("Display Name"), {
        target: { value: "Test User" },
      });
      const avatars = screen.getAllByAltText("Avatar");
      fireEvent.click(avatars[0]);

      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      await waitFor(() => {
        expect(screen.getByText("Insert failed")).toBeInTheDocument();
      });
    });
  });

  describe("Edit mode", () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams("mode=edit");
    });

    it("should render the edit mode title", () => {
      mockSingle.mockResolvedValue({
        data: { display_name: "Alex", avatar_url: "https://example.com/a.svg" },
        error: null,
      });

      render(<ProfileSetup />);
      expect(screen.getByText("Edit your profile")).toBeInTheDocument();
    });

    it("should show loading state while fetching profile", () => {
      mockSingle.mockReturnValue(new Promise(() => {})); // never resolves

      render(<ProfileSetup />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should prefill form with existing profile data", async () => {
      mockSingle.mockResolvedValue({
        data: {
          display_name: "Alex Johnson",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
        },
        error: null,
      });

      render(<ProfileSetup />);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText("Display Name");
      expect(input).toHaveValue("Alex Johnson");
    });

    it("should show Save button in edit mode", async () => {
      mockSingle.mockResolvedValue({
        data: {
          display_name: "Alex",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
        },
        error: null,
      });

      render(<ProfileSetup />);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("should call update and navigate to settings on submit", async () => {
      mockSingle.mockResolvedValue({
        data: {
          display_name: "Alex",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
        },
        error: null,
      });
      mockUpdate.mockResolvedValue({ error: null });

      render(<ProfileSetup />);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Change name and submit
      fireEvent.change(screen.getByLabelText("Display Name"), {
        target: { value: "Alex Updated" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            display_name: "Alex Updated",
          }),
        );
        expect(mockPush).toHaveBeenCalledWith("/appview/settings");
      });
    });

    it("should show error when profile fetch fails", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error("Fetch failed"),
      });

      render(<ProfileSetup />);

      await waitFor(() => {
        expect(screen.getByText("Fetch failed")).toBeInTheDocument();
      });
    });

    it("should show error when update fails", async () => {
      mockSingle.mockResolvedValue({
        data: {
          display_name: "Alex",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
        },
        error: null,
      });
      mockUpdate.mockResolvedValue({
        error: new Error("Update failed"),
      });

      render(<ProfileSetup />);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(screen.getByText("Update failed")).toBeInTheDocument();
      });
    });
  });
});
