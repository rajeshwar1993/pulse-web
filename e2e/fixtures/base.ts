import { test as baseTest, expect } from "@playwright/test";
import { FlutterBridgeMock } from "./flutter-bridge";

/**
 * Extended Playwright test fixture that provides:
 * - FlutterBridge mock (automatically installed before each navigation)
 */
type Fixtures = {
  flutterBridge: FlutterBridgeMock;
};

export const test = baseTest.extend<Fixtures>({
  flutterBridge: async ({ page }, use) => {
    const bridge = new FlutterBridgeMock(page);
    await bridge.install();
    await use(bridge);
  },
});

export { expect };
