import type { Viewport } from "next";
import { FlutterBridgeListener } from "@/components/providers/flutter-bridge-listener";

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
    <div className="safe-area-inset">
      <FlutterBridgeListener />
      {children}
    </div>
  );
}
