import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { FlutterBridgeListener } from "@/components/providers/flutter-bridge-listener";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pulse - Effortless Peace of Mind",
  description: "Mutual reassurance through simple check-ins",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Important for iOS safe areas
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${instrumentSans.variable} antialiased safe-area-inset`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FlutterBridgeListener />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
