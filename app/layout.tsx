import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon Trainer Journal",
  description: "A completionist field journal for Pokémon animation.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/assets/core/02-kanto-journey-vignette.png",
    shortcut: "/assets/core/02-kanto-journey-vignette.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
