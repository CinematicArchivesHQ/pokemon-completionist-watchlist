import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Pokémon Trainer Journal",
  description: "A completionist field journal for Pokémon animation.",
  applicationName: "Pokémon Trainer Journal",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "Trainer Journal",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: `${basePath}/icons/app-icon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/icons/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/icons/favicon-16.png`, sizes: "16x16", type: "image/png" },
    ],
    shortcut: `${basePath}/icons/favicon-32.png`,
    apple: [
      { url: `${basePath}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
      { url: `${basePath}/icons/apple-touch-icon-152.png`, sizes: "152x152", type: "image/png" },
      { url: `${basePath}/icons/apple-touch-icon-167.png`, sizes: "167x167", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: `${basePath}/icons/safari-pinned-tab.svg`, color: "#bd4635" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5ecd6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
