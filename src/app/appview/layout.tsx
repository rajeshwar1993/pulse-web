import type { Viewport } from "next";
import { BottomNav } from "@/components/appview/bottom-nav";
import { FlutterBridgeListener } from "@/components/providers/flutter-bridge-listener";
import { ToastProvider } from "@/components/providers/toast-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Important for iOS safe areas
};

export default function AppViewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="safe-area-inset pb-20">
      <FlutterBridgeListener />
      <ToastProvider>{children}</ToastProvider>
      <BottomNav />
    </div>
  );
}
