import { type Page } from "@playwright/test";

export interface FlutterBridgeMessage {
  type: string;
  [key: string]: unknown;
}

/**
 * Mock for `window.FlutterBridge` used in the WebView.
 * Captures messages sent from the web app to Flutter and
 * provides helpers to simulate Flutter-to-web communication.
 */
export class FlutterBridgeMock {
  readonly messages: FlutterBridgeMessage[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Install the FlutterBridge mock on the page.
   * Call this before navigating so the mock is available when scripts run.
   */
  async install(): Promise<void> {
    await this.page.addInitScript(() => {
      (window as any).__flutterBridgeMessages = [];
      (window as any).FlutterBridge = {
        postMessage(message: string) {
          try {
            const parsed = JSON.parse(message);
            (window as any).__flutterBridgeMessages.push(parsed);
          } catch {
            (window as any).__flutterBridgeMessages.push({ raw: message });
          }
        },
      };
    });
  }

  /**
   * Retrieve all messages sent to FlutterBridge so far.
   */
  async getMessages(): Promise<FlutterBridgeMessage[]> {
    return this.page.evaluate(
      () => (window as any).__flutterBridgeMessages || [],
    );
  }

  /**
   * Wait for a specific message type to be sent to FlutterBridge.
   */
  async waitForMessage(
    type: string,
    timeout = 10_000,
  ): Promise<FlutterBridgeMessage> {
    return this.page.waitForFunction(
      (t) => {
        const msgs = (window as any).__flutterBridgeMessages || [];
        return msgs.find((m: any) => m.type === t);
      },
      type,
      { timeout },
    ) as unknown as Promise<FlutterBridgeMessage>;
  }

  /**
   * Simulate Flutter dispatching a locale change event to the web app.
   */
  async sendLocaleChanged(locale: string): Promise<void> {
    await this.page.evaluate((loc) => {
      window.dispatchEvent(
        new CustomEvent("flutter-locale-changed", {
          detail: { locale: loc },
        }),
      );
    }, locale);
  }
}
