/** FlutterBridge JavaScript channel injected by the Flutter WebView shell */
interface FlutterBridge {
  postMessage(message: string): void;
}

interface Window {
  /** Available when running inside pulse-app's WebView */
  FlutterBridge?: FlutterBridge;
}
