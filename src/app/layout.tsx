import type { Metadata, Viewport } from "next";

import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Master Control | Escape Room Control Software",
    template: "%s | Master Control",
  },
  description: siteConfig.description,
  keywords: [
    "escape room control software",
    "escape room hint system",
    "escape room game master software",
    "escape room reset checklist",
    "escape room control panel",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
