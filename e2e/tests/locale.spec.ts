import { test, expect } from '../fixtures/base';

test.describe('Locale', () => {
  test('FlutterBridge locale change event is received by the app', async ({
    page,
    flutterBridge,
  }) => {
    await page.goto('/appview/dashboard');

    // Simulate Flutter sending a locale change event
    await flutterBridge.sendLocaleChanged('en');

    // Verify the event was dispatched — the FlutterBridgeListener component
    // should process it. We can verify by checking that localStorage was updated.
    const storedLocale = await page.evaluate(() => {
      return localStorage.getItem('pulse-locale');
    });

    // The locale service should have persisted the locale
    expect(storedLocale).toBe('en');
  });

  test('FlutterBridge mock captures outgoing messages', async ({
    page,
    flutterBridge,
  }) => {
    await page.goto('/appview/dashboard');

    // The dashboard sends a 'ready' message on load
    await flutterBridge.waitForMessage('ready');

    const messages = await flutterBridge.getMessages();
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].type).toBe('ready');
  });
});
