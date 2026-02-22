import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlutterBridgeListener } from "../flutter-bridge-listener";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

const mockSetStoredLocale = vi.fn();

vi.mock("@/lib/services/locale-service", () => ({
  LocaleService: {
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    setStoredLocale: (...args: any[]) => mockSetStoredLocale(...args),
  },
}));

vi.mock("@/i18n/config", () => ({
  supportedLocales: ["en"],
  defaultLocale: "en",
}));

function dispatchLocaleEvent(locale: string) {
  const event = new CustomEvent("flutter-locale-changed", {
    detail: { locale },
  });
  window.dispatchEvent(event);
}

describe("FlutterBridgeListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render nothing", () => {
    const { container } = render(<FlutterBridgeListener />);
    expect(container.innerHTML).toBe("");
  });

  it("should set locale and refresh on valid locale event", () => {
    render(<FlutterBridgeListener />);

    dispatchLocaleEvent("en");

    expect(mockSetStoredLocale).toHaveBeenCalledWith("en");
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it("should ignore unsupported locale", () => {
    render(<FlutterBridgeListener />);

    dispatchLocaleEvent("fr");

    expect(mockSetStoredLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("should ignore event with empty locale", () => {
    render(<FlutterBridgeListener />);

    dispatchLocaleEvent("");

    expect(mockSetStoredLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<FlutterBridgeListener />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "flutter-locale-changed",
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });

  it("should not respond to events after unmount", () => {
    const { unmount } = render(<FlutterBridgeListener />);
    unmount();

    dispatchLocaleEvent("en");

    expect(mockSetStoredLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
